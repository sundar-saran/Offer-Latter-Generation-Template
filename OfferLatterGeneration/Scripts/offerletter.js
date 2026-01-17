var savedRange = null;
let sharedHeaderHTML = "";
let isPaginating = false;
let paginationTimeout = null;

// ================= INIT EDITOR =================
function initEditors() {
    tinymce.remove();

    tinymce.init({
        selector: ".editor-body",
        inline: true,
        fixed_toolbar_container: "#editorToolbar",
        menubar: true,               // cleaner
        branding: false,
        promotion: false,
        license_key: 'gpl',
        plugins: 'lists table image link code paste',  // paste explicitly
        toolbar:
            'undo redo | fontfamily fontsize | bold italic underline | ' +
            'alignleft aligncenter alignright | bullist numlist | insertfield table image link code',
        paste_as_text: false,
        paste_data_images: true,      // allow pasted images
        paste_block_drop: false,      // allow drag-drop
        paste_preprocess: function (plugin, args) {
            args.content = normalizePastedHTML(args.content);
        },
        paste_postprocess: function () {
            setTimeout(forcePaginateAndUpdate, 600);
        },
        automatic_uploads: true,
        images_upload_handler: function (blobInfo, success) {
            const reader = new FileReader();
            reader.onload = () => success(reader.result);
            reader.readAsDataURL(blobInfo.blob());
        },
        setup(editor) {
            editor.on('keyup', debounce(schedulePagination, 1000));
            editor.on('paste', () => setTimeout(forcePaginateAndUpdate, 500));
            editor.on('focus', () => {
                savedRange = editor.selection.getRng();
                clearTimeout(paginationTimeout);
            });
            editor.on('blur', forcePaginateAndUpdate);

            editor.ui.registry.addMenuButton('insertfield', {
                text: 'Insert Field',
                fetch: (callback) => {
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
        }
    });
}
function fieldItem(editor, name) {
    return {
        type: 'menuitem',
        text: name.replace(/([A-Z])/g, ' $1'),
        onAction: () => editor.insertContent(`<strong data-field="${name}">{{${name}}}</strong>`)
    };
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function schedulePagination() {
    clearTimeout(paginationTimeout);
    paginationTimeout = setTimeout(() => {
        if (!isPaginating && !document.querySelector('.editor-body:focus-within')) {
            forcePaginateAndUpdate();
        }
    }, 1200);
}
// ================= PAGINATION CORE =================
function paginateAllPages() {
    if (isPaginating) return;
    isPaginating = true;

    let changed;
    let guard = 0;

    do {
        changed = false;
        guard++;
        const pages = [...document.querySelectorAll(".page")];

        for (let i = 0; i < pages.length; i++) {
            if (paginateSinglePage(pages[i])) {
                changed = true;
            }
        }
    } while (changed && guard < 100);

    cleanupEmptyPages();
    updatePageNumbers();
    isPaginating = false;
}

function paginateSinglePage(page) {
    const body = page.querySelector(".page-body");
    if (!body) return false;

    // Critical fix: temporarily clip to measure real scrollHeight
    const originalOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    body.style.height = 'auto'; // ensure no fixed height interference

    const maxHeight = getMaxBodyHeight(page);

    if (body.scrollHeight <= maxHeight + 10) {
        body.style.overflow = originalOverflow;
        return false;
    }

    const nextPage = getOrCreateNextPage(page);
    const nextBody = nextPage.querySelector(".page-body");
    let moved = false;

    while (body.scrollHeight > maxHeight + 10 && body.lastElementChild) {
        const last = body.lastElementChild;
        if (last.tagName === 'P' || last.tagName === 'DIV' || last.tagName === 'OL' || last.tagName === 'UL') {
            splitOrMoveBlock(last, nextBody, maxHeight, body);
        } else {
            nextBody.appendChild(last);
        }
        moved = true;
    }

    body.style.overflow = originalOverflow;
    return moved;
}

function splitOrMoveBlock(el, nextBody, maxHeight, currentBody) {
    if (!el.textContent.trim()) {
        el.remove();
        return;
    }

    if (el.tagName !== 'P') {
        nextBody.appendChild(el);
        return;
    }

    // Binary search split point
    const words = el.innerHTML.split(/(\s+)/).filter(Boolean);
    let l = 0, r = words.length;

    while (l < r) {
        const m = Math.ceil((l + r) / 2);
        el.innerHTML = words.slice(0, m).join('');
        if (currentBody.scrollHeight > maxHeight) {
            r = m - 1;
        } else {
            l = m;
        }
    }

    const overflow = words.slice(l).join('').trim();
    el.innerHTML = words.slice(0, l).join('').trim();

    if (overflow) {
        const np = document.createElement('p');
        np.innerHTML = overflow;
        nextBody.appendChild(np);
    }

    if (!el.innerHTML.trim() && el.parentNode) el.remove();
}

function getMaxBodyHeight(page) {
    const header = page.querySelector(".page-header");
    const footer = page.querySelector(".page-footer");
    return page.clientHeight
        - (header?.offsetHeight || 0)
        - (footer?.offsetHeight || 0)
        - 65; // increased buffer for padding/margins/line-height
}

function getOrCreateNextPage(current) {
    let nxt = current.nextElementSibling;
    if (nxt?.classList.contains('page')) return nxt;

    document.getElementById("documentArea").insertAdjacentHTML("beforeend", createBlankPage());
    initEditors();
    syncHeaders();
    return current.nextElementSibling;
}

function cleanupEmptyPages() {
    document.querySelectorAll(".page").forEach((p, i) => {
        if (i === 0) return;
        const b = p.querySelector(".page-body");
        if (b && b.textContent.trim().length < 5) p.remove();
    });
}

// ================= PAGE NUMBERS =================
function updatePageNumbers() {
    const pages = document.querySelectorAll('.page');
    pages.forEach((p, i) => {
        let f = p.querySelector('.page-footer');
        if (!f) {
            f = document.createElement('div');
            f.className = 'page-footer';
            p.appendChild(f);
        }
        f.textContent = `Page ${i + 1} of ${pages.length}`;
    });
}

// ================= OTHER FUNCTIONS (mostly unchanged) =================
function normalizePastedHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("o\\:p, xml, [class*='Mso']").forEach(el => el.remove());
    div.querySelectorAll("*").forEach(el => {
        const align = el.style.textAlign;
        el.removeAttribute("style");
        if (align) el.style.textAlign = align;
    });
    div.querySelectorAll("span, font").forEach(el => el.replaceWith(...el.childNodes));
    div.querySelectorAll("p").forEach(p => {
        if (!p.innerHTML.trim()) p.innerHTML = "<br>";
    });
    return div.innerHTML;
}

function onCompanyTemplateChange() {
    const offerId = document.getElementById("OfferLetterId")?.value;
    if (offerId && parseInt(offerId) > 0) {
        alert("Cannot change template on existing offer letter.");
        document.getElementById("companyTemplate").value = "default";
        return;
    }
    if (!confirm("Changing template will clear current content. Continue?")) return;

    document.getElementById("documentArea").innerHTML = createBlankPage();
    initEditors();
}


// ================= TEMPLATE =================
function createBlankPage() {
    const sz = document.getElementById("pageSize")?.value || "A4";
    return `
    <div class="page ${sz}">
        <div class="page-body editor-body">
            <p><br></p>
        </div>
        <div class="page-footer"></div>
    </div>`;
}


function syncHeaders() {
    const first = document.querySelector(".page:first-child .page-header");
    if (!first) return;
    sharedHeaderHTML = first.innerHTML;
    document.querySelectorAll(".page:not(:first-child) .page-header")
        .forEach(h => h.innerHTML = sharedHeaderHTML);
}
function addPage() {
    document.getElementById("documentArea").insertAdjacentHTML("beforeend", createBlankPage());
    initEditors();
    updatePageNumbers();
}

function changePageSize() {
    const size = document.getElementById("pageSize").value;
    document.querySelectorAll(".page").forEach(p => p.className = `page ${size}`);
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

function forcePaginateAndUpdate() {
    paginateAllPages();
    updatePageNumbers();
}

document.addEventListener("DOMContentLoaded", () => {
    const area = document.getElementById("documentArea");
    const id = document.getElementById("OfferLetterId")?.value;

    if (!id || id === "0") {
        area.innerHTML = createBlankPage();
    }

    initEditors();
    setTimeout(forcePaginateAndUpdate, 600);
});