using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using OfferLatterGeneration.Models;
using Rotativa;
using Rotativa.Options;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Mvc;
using HtmlToOpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Size = Rotativa.Options.Size;

namespace OfferLatterGeneration.Controllers
{
    public class OfferLetterController : Controller
    {
        public static List<OfferLetterModel> OfferLetters = new List<OfferLetterModel>();

        public ActionResult Index()
        {
            return View(OfferLetters);
        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult Save(OfferLetterModel model)
        {
            if (model.Id > 0)
            {
                var existing = OfferLetters.Find(x => x.Id == model.Id);
                if (existing != null)
                {
                    existing.CandidateName = model.CandidateName;
                    existing.Designation = model.Designation;
                    existing.Department = model.Department;
                    existing.Location = model.Location;
                    existing.Salary = model.Salary;
                    existing.JoiningDate = model.JoiningDate;
                    existing.LetterBody = model.LetterBody;
                }
            }
            else
            {
                // CREATE
                model.Id = OfferLetters.Count + 1;
                OfferLetters.Add(model);
            }

            return Json(new { success = true });
        }

        public ActionResult Create()
        {
            TempData["IsCreate"] = true;
            return View(new OfferLetterModel());
        }

        public ActionResult Edit(int id)
        {
            var model = OfferLetters.FirstOrDefault(x => x.Id == id);

            if (model == null)
            {
                return HttpNotFound();
            }

            return View("Create", model);
        }

        public ActionResult ExportPdf(int id)
        {
            var model = OfferLetters.FirstOrDefault(x => x.Id == id);
            if (model == null)
                return HttpNotFound();

            return new ViewAsPdf("ExportPdf", model)
            {
                FileName = $"OfferLetter_{model.CandidateName}.pdf",
                PageSize = Size.A4,
                PageOrientation = Orientation.Portrait,
                CustomSwitches =
                    "--disable-smart-shrinking " +
                    "--print-media-type " +
                    "--margin-top 10mm --margin-bottom 10mm --margin-left 10mm --margin-right 10mm"
            };
        }

        private void AddWordStyles(MainDocumentPart mainPart)
        {
            var stylesPart = mainPart.AddNewPart<StyleDefinitionsPart>();

            stylesPart.Styles = new Styles(

                new Style(
                    new Name { Val = "Normal" },
                    new BasedOn { Val = "Normal" },
                    new UIPriority { Val = 1 },
                    new StyleRunProperties(
                        new RunFonts { Ascii = "Arial" },
                        new FontSize { Val = "22" }
                    )
                )
                {
                    Type = StyleValues.Paragraph,
                    StyleId = "Normal",
                    Default = true
                },

                new Style(
                    new Name { Val = "Company Title" },
                    new UIPriority { Val = 10 },
                    new StyleParagraphProperties(
                        new Justification { Val = JustificationValues.Center }
                    ),
                    new StyleRunProperties(
                        new Bold(),
                        new FontSize { Val = "28" }
                    )
                )
                {
                    Type = StyleValues.Paragraph,
                    StyleId = "CompanyTitle",
                    CustomStyle = true
                },

                new Style(
                    new Name { Val = "Offer Subtitle" },
                    new UIPriority { Val = 11 },
                    new StyleParagraphProperties(
                        new Justification { Val = JustificationValues.Center }
                    ),
                    new StyleRunProperties(
                        new Bold(),
                        new FontSize { Val = "24" }
                    )
                )
                {
                    Type = StyleValues.Paragraph,
                    StyleId = "OfferSubtitle",
                    CustomStyle = true
                }
            );

            stylesPart.Styles.Save();
        }

        private string ExtractDiv(string html, string className)
        {
            var match = Regex.Match(
                html,
                $@"<div[^>]*class\s*=\s*[""'][^""']*{className}[^""']*[""'][^>]*>([\s\S]*?)</div>\s*(?=<div|\z)",
                RegexOptions.IgnoreCase
            );

            return match.Success ? match.Groups[1].Value : "";
        }

        private void CreateHeaderFooter(
            MainDocumentPart mainPart,
            SectionProperties sectionProps,
            string headerHtml,
            string footerHtml)
                {
                    var converter = new HtmlConverter(mainPart);

                    // HEADER
                    var headerPart = mainPart.AddNewPart<HeaderPart>();
                    headerPart.Header = new Header();

                    foreach (var el in converter.Parse(headerHtml))
                    {
                        headerPart.Header.Append(el.CloneNode(true));
                    }

                    // FOOTER
                    var footerPart = mainPart.AddNewPart<FooterPart>();
                    footerPart.Footer = new Footer();

                    foreach (var el in converter.Parse(footerHtml))
                    {
                        footerPart.Footer.Append(el.CloneNode(true));
                    }

                    sectionProps.Append(
                        new HeaderReference
                        {
                            Type = HeaderFooterValues.Default,
                            Id = mainPart.GetIdOfPart(headerPart)
                        },
                        new FooterReference
                        {
                            Type = HeaderFooterValues.Default,
                            Id = mainPart.GetIdOfPart(footerPart)
                        }
                    );
                }


        public ActionResult ExportWord(int id)
        {
            var model = OfferLetters.FirstOrDefault(x => x.Id == id);
            if (model == null)
                return HttpNotFound();

            using (var ms = new MemoryStream())
            {
                using (var wordDoc = WordprocessingDocument.Create(
                    ms,
                    WordprocessingDocumentType.Document,
                    true))
                {
                    var mainPart = wordDoc.AddMainDocumentPart();
                    mainPart.Document = new Document(new Body());
                    var body = mainPart.Document.Body;

                    // A4 setup
                    body.AppendChild(new SectionProperties(
                        new PageSize { Width = 11906, Height = 16838 },
                        new PageMargin
                        {
                            Top = 720,
                            Bottom = 720,
                            Left = 720,
                            Right = 720
                        }
                    ));

                    var converter = new HtmlConverter(mainPart);

                    // ✅ SPLIT BY PAGE
                    var pages = Regex.Split(
                        model.LetterBody ?? "",
                        @"<div[^>]*class\s*=\s*[""']page[^""']*[""'][^>]*>",
                        RegexOptions.IgnoreCase
                    ).Where(p => !string.IsNullOrWhiteSpace(p)).ToList();

                    for (int i = 0; i < pages.Count; i++)
                    {
                        // Clean closing div
                        var html = pages[i].Replace("</div>", "");

                        // Convert HTML → Word
                        converter.ParseHtml(html);

                        // ✅ INSERT PAGE BREAK (EXCEPT LAST PAGE)
                        if (i < pages.Count - 1)
                        {
                            body.AppendChild(
                                new Paragraph(
                                    new Run(
                                        new Break { Type = BreakValues.Page }
                                    )
                                )
                            );
                        }
                    }

                    mainPart.Document.Save();
                }

                return File(
                    ms.ToArray(),
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    $"OfferLetter_{model.CandidateName}.docx"
                );
            }
        }

    }
}