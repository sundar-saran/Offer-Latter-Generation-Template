var savedRange = null;
let sharedHeaderHTML = "";


let paginateTimer = null;
let isPaginating = false;

/* ================= INIT EDITOR ================= */
function initEditors() {
    tinymce.remove();

    tinymce.init({
        selector: ".editor-body",
        inline: true,
        fixed_toolbar_container: "#editorToolbar",
        menubar: true,
        branding: true,
        license_key: 'gpl',
        promotion: false,
        plugins: 'lists table image link autoresize code',

        toolbar:
            'undo redo | fontfamily fontsize | ' +
            'bold italic underline | ' +
            'alignleft aligncenter alignright | ' +
            'bullist numlist | insertfield table image',
        paste_as_text: false,

        paste_preprocess: function (plugin, args) {
            args.content = normalizePastedHTML(args.content);
        },

        paste_postprocess: function () {
            setTimeout(() => {
                paginateAllPages();
            }, 50);
        },

        font_family_formats:
            'Times New Roman=Times New Roman;' +
            'Arial=Arial;Calibri=Calibri;Georgia=Georgia;Verdana=Verdana',

        fontsize_formats: '10px 12px 14px 16px 18px 24px 32px',

        automatic_uploads: true,

        images_upload_handler: function (blobInfo, success) {
            const reader = new FileReader();
            reader.onload = () => success(reader.result);
            reader.readAsDataURL(blobInfo.blob());
        },

        setup(editor) {

            editor.on('keyup paste', schedulePagination);

            editor.on('focus', () => {
                savedRange = editor.selection.getRng();
            });

            editor.ui.registry.addMenuButton('insertfield', {
                text: 'Insert Field',
                fetch(callback) {
                    callback([
                        fieldItem(editor, 'CandidateName'),
                        fieldItem(editor, 'Designation'),
                        fieldItem(editor, 'Department'),
                        fieldItem(editor, 'Salary'),
                        fieldItem(editor, 'JoiningDate'),
                        fieldItem(editor, 'Location'),
                        fieldItem(editor, 'OfferDate')
                    ]);
                }
            });
        },
        setup(editor) {
            editor.on("keyup paste", () => {
                if (editor.getElement().classList.contains("master-header")) {
                    syncHeaders();
                }
                schedulePagination();
            });
        }

    });
}

const offerTemplates = {
    default: createBlankPage,
    arit: createBlankPage,
    other: createBlankPage
};

function normalizePastedHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;

    // Remove Word garbage
    div.querySelectorAll("span, font").forEach(el => {
        el.replaceWith(...el.childNodes);
    });

    // Remove inline styles except text-align
    div.querySelectorAll("*").forEach(el => {
        const align = el.style.textAlign;
        el.removeAttribute("style");
        if (align) el.style.textAlign = align;
    });

    // Normalize paragraphs
    div.querySelectorAll("p").forEach(p => {
        if (!p.innerHTML.trim()) p.innerHTML = "<br>";
    });

    return div.innerHTML;
}


function onCompanyTemplateChange() {

    const offerId = document.getElementById("OfferLetterId")?.value;

    if (offerId && offerId > 0) {
        alert("Template cannot be changed while editing an existing offer.");
        document.getElementById("companyTemplate").value = "default";
        return;
    }

    if (!confirm("This will reset the document. Continue?")) return;

    document.getElementById("documentArea").innerHTML = createBlankPage();

    initEditors();
}

/* helper */
function fieldItem(editor, name) {
    return {
        type: 'menuitem',
        text: name.replace(/([A-Z])/g, ' $1'),
        onAction: () =>
            editor.insertContent(`<strong data-field="${name}">{{${name}}}</strong>`)
    };
}

/* debounce pagination */
function debouncePaginate() {
    clearTimeout(paginateTimer);
    paginateTimer = setTimeout(autoPaginateAllPages, 200);
}


function schedulePagination() {
    clearTimeout(paginateTimer);
    paginateTimer = setTimeout(paginateAllPages, 300);
}

function paginateAllPages() {
    if (isPaginating) return;
    isPaginating = true;

    const pages = [...document.querySelectorAll(".page")];
    pages.forEach(paginatePage);

    cleanupEmptyPages();
    isPaginating = false;
}

function paginatePage(page) {
    const body = page.querySelector(".page-body");
    const maxHeight = getMaxBodyHeight(page);

    while (body.scrollHeight > maxHeight) {

        const lastNode = body.lastChild;
        if (!lastNode) break;

        const nextPage = getOrCreateNextPage(page);
        const nextBody = nextPage.querySelector(".page-body");

        // If paragraph too large → split it
        if (lastNode.nodeType === 1 && lastNode.tagName === "P") {
            splitParagraph(lastNode, nextBody, maxHeight);
        } else {
            nextBody.prepend(lastNode);
        }
    }
}

function splitParagraph(p, nextBody, maxHeight) {

    const words = p.innerHTML.split(" ");
    let keep = "";
    let move = "";

    while (words.length) {
        keep += words.shift() + " ";
        p.innerHTML = keep;

        if (p.parentElement.scrollHeight > maxHeight) {
            move = keep;
            keep = "";
            break;
        }
    }

    if (move.trim()) {
        const newP = document.createElement("p");
        newP.innerHTML = move;
        nextBody.prepend(newP);
    }
}


function getMaxBodyHeight(page) {
    const header = page.querySelector(".page-header");
    const footer = page.querySelector(".page-footer");

    return page.clientHeight
        - (header?.offsetHeight || 0)
        - (footer?.offsetHeight || 0)
        - 20;
}

function getOrCreateNextPage(page) {
    let next = page.nextElementSibling;
    if (next && next.classList.contains("page")) return next;

    document.getElementById("documentArea")
        .insertAdjacentHTML("beforeend", createBlankPage());
    syncHeaders();
    initEditors();
    return page.nextElementSibling;
}

function cleanupEmptyPages() {
    document.querySelectorAll(".page").forEach((page, i) => {
        if (i === 0) return;
        const body = page.querySelector(".page-body");
        if (!body.textContent.trim()) page.remove();
    });
}

/* ================= PAGE ACTIONS ================= */
function addPage() {
    document.getElementById("documentArea")
        .insertAdjacentHTML("beforeend", createBlankPage());

    initEditors();
}

function removePage(btn) {
    const pages = document.querySelectorAll(".page");
    if (pages.length === 1) {
        alert("At least one page is required");
        return;
    }
    btn.closest(".page").remove();
}

function getFieldValue(fieldName) {

    const el = document.querySelector(`[data-field="${fieldName}"]`);

    // If field exists in editor → take from editor
    if (el) {
        return el.innerText.replace(`{{${fieldName}}}`, "").trim();
    }

    // Fallback → take from model (hidden server-rendered values)
    const fallback = document.getElementById(`fallback_${fieldName}`);
    return fallback ? fallback.value : "";
}

function insertFieldFromToolbar() {

    const field = document.getElementById("fieldSelector").value;

    if (!field) {
        alert("Please select a field");
        return;
    }

    const html =
        `<strong data-field="${field}">{{${field}}}</strong>`;

    tinymce.activeEditor.insertContent(html);

    // Reset dropdown
    document.getElementById("fieldSelector").value = "";
}

function saveLetter() {

    const formData = new FormData();

    formData.append("Id", document.getElementById("OfferLetterId")?.value || 0);

    formData.append("CandidateName", getFieldValue("CandidateName"));
    formData.append("Designation", getFieldValue("Designation"));
    formData.append("Department", getFieldValue("Department"));
    formData.append("Location", getFieldValue("Location"));
    formData.append("Salary", getFieldValue("Salary"));
    formData.append("JoiningDate", getFieldValue("JoiningDate"));

    formData.append(
        "LetterBody",
        document.getElementById("documentArea").innerHTML
    );


    fetch(window.offerLetterSaveUrl, {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Offer Letter saved successfully");
                window.location.href = window.offerLetterIndexUrl;
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error while saving offer letter");
        });
}

/* ================= PAGE SIZE ================= */
function changePageSize() {
    const size = document.getElementById("pageSize").value;
    document.querySelectorAll(".page").forEach(p => {
        p.className = "page " + size;
    });
}

/* ================= CREATE PAGE ================= */
function createBlankPage(isFirst = false) {
    const size = document.getElementById("pageSize")?.value || "A4";

    return `
    <div class="page ${size}">
        

        <div class="page-body editor-body">
            <p><br></p>
        </div>

        
    </div>`;
}

function syncHeaders() {
    const firstHeader = document.querySelector(".page:first-child .page-header");
    if (!firstHeader) return;

    sharedHeaderHTML = firstHeader.innerHTML;

    document.querySelectorAll(".page:not(:first-child) .page-header")
        .forEach(h => h.innerHTML = sharedHeaderHTML);
}

/* ================= INIT DOCUMENT ================= */
document.addEventListener("DOMContentLoaded", () => {
    const docArea = document.getElementById("documentArea");
    const offerId = document.getElementById("OfferLetterId")?.value;

    if (!offerId || offerId == 0) {
        docArea.innerHTML = createBlankPage();
    }

    initEditors();
});
