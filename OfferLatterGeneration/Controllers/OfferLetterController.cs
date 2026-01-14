using OfferLatterGeneration.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Rotativa;
using Rotativa.Options;


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
                CustomSwitches = "--disable-smart-shrinking"
            };
        }

    }
}