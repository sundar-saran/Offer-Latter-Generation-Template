var savedRange = null;
document.addEventListener("click", function (e) {

    if (!tablePicker) return;

    const isClickInsidePicker = tablePicker.contains(e.target);
    const isTableButton = e.target.closest("button[onclick*='toggleTablePicker']");

    if (!isClickInsidePicker && !isTableButton) {
        tablePicker.classList.add("hidden");
        clearTableHighlight();
    }
});


const offerTemplates = {

    default: `
<div class="page A4" contenteditable="true">
    <div class="page-header">Offer of Employment</div>
    <div class="page-body" contenteditable="true">

        <p>Dear <strong data-field="CandidateName">{{CandidateName}}</strong>,</p>

        <p>
            We are pleased to offer you employment as
            <strong data-field="Designation">{{Designation}}</strong> in the
            <strong data-field="Department">{{Department}}</strong> department at
            <strong data-field="Location">{{Location}}</strong>.
        </p>

        <h5>Compensation</h5>
        <table class="table table-bordered">
            <tr>
                <th>Total CTC</th>
                <td data-field="Salary">{{Salary}}</td>
            </tr>
        </table>

        <p>
            Your joining date will be
            <strong data-field="JoiningDate">{{JoiningDate}}</strong>.
        </p>

        <p>
            Sincerely,<br />
            <strong>HR Department</strong>
        </p>
    </div>
    <div class="page-footer">Page <span class="page-number">1</span></div>

</div>
`,

    arit: `
<div class="page A4">
    <div class="page-header">
        <div class="company-title">AnandRathi IT Private Limited</div>
    </div>

    <div class="page-body" contenteditable="true">

        <p class="doc-right"><strong>Date:</strong> {{JoiningDate}}</p>

        <p>
            <strong>{{CandidateName}}</strong><br/>
            {{Location}}
        </p>

        <p class="doc-title text-center">Appointment Letter</p>

        <p>Dear <strong data-field="CandidateName">{{CandidateName}}</strong>,</p>

        <p>
            With reference to your application and the subsequent interview,
            we are pleased to appoint you as
            <strong data-field="Designation">{{Designation}}</strong>
            in Grade <strong>{{E1}}</strong>.
        </p>
        <p>The terms and conditions of this appointment are as under: - </p>
        <h4 class="section-title">1. Date of Joining: </h4>
        <ol>
            <li>
                Your date of joining will be on or before <strong data-field="JoiningDate"></strong> post which this Appointment letter stands null and void unless specifically agreed in writing otherwise.
            </li>
        </ol>

        <h4 class="section-title">2. Place of Posting: </h4>
        <ol>
            <li>
                You will initially be posted at our office in <strong data-field="Location">{{Location}}</strong> however, you are liable to be transferred to any department or office forming part of our organization or to any of our associate / subsidiary Companies in India or overseas, depending upon the requirements of business.
            </li>
        </ol>

        <h4 class="section-title">3. Annual Compensation: </h4>
        <ol>
            <li>
                Your Annual Gross Salary will be Rs. <strong data-field="Salary">{{Salary}}</strong>/- (Salary in Words) per annum. This will include all statutory contributions (like PF, ESIC etc. made by the company on your behalf) if currently applicable to you or as and when it becomes applicable in future.
            </li>
            <li>
                You will be governed at all times by the policies, procedures and rules of the Company which are in force from time to time related to the salary, allowances, benefits and perquisites which are applicable to you and will be subject to deduction of appropriate taxes at source. Further, the Company, at its sole discretion, may modify or change such allowances, benefits and perquisites from time to time in accordance with its policies.
            </li>
            <li>
                In addition to the <strong data-field="AnnualGrossSalary">{{AnnualGrossSalary}}</strong>, you will also be eligible for performance linked incentive / bonus / variable pay, subject to satisfactory performance, as per the company's policy applicable to your category. Compensation and Career progression shall be dependent on performance / conduct and in no case shall be construed to be a matter of right.
            </li>
            <li>
                Details of the compensation package are strictly confidential and the same should not be disclosed to any third party.
            </li>
        </ol>

        <h4 class="section-title">4. Employee Code: </h4>
        <ol>
            <li>
                Your Employee Code will be <strong data-field="EmpCode">{{EmpCode}}</strong>. This should be used for all internal communication including systems of logging of sales / any business done by you etc
            </li>
        </ol>

        <h4 class="section-title">5. Probation Period: </h4>
        <ol>
            <li>
                Confirmation of your services is subject to satisfactory performance during your probation period of 6 months. Your services would deem to be confirmed and continued unless formally and specifically extended upon assessment by your <strong>Reporting Authority</strong>.
            </li>
            <li>
                The Company reserves the right to terminate your services during the Probation Period or extended Probation Period without any notice or salary in lieu thereof or without assigning any reason.
            </li>
            <li>
                During the Probation Period or extended Probation Period, you may, by giving 30days notice, terminate your employment.
            </li>
        </ol>

        <h4 class="section-title">6. Particulars of your Role: </h4>
        <ol>
            <li>
                The Company forever reserves its right to change your designation/grade/ department and/or transfer you to some other branch/business vertical/Group company.
            </li?
        </ol>

        <h4 class="section-title">7. Resignation and Termination of Services: </h4>
        <ol>
            <li>
                Your employment can be ended or terminated by either side with a written notice of 30 days or salary in lieu thereof.
            </li>
            <li>
                Post confirmation (i.e. after expiry of Probation Period or extended Probation Period, as the case may be), either party can terminate the employment by giving <strong>90 days</strong> written notice or salary in lieu thereof.
            </li>
            <li>
                Not with standing anything contained in clause 5.3 and 7.1 above, in case of your resignation, the company at its sole discretion will have an option to ask you to serve the entire Notice Period, or accept your resignation and relieve you prior to completion of your stipulated notice period without any salary in lieu of the remaining period of notice.
            </li>
            <li>
                Your employment can be terminated by the Company without written or verbal notice or salary in lieu thereof, in case of the below described circumstances: Non - compliance of regulatory requirements, dishonesty, disobedience, disorderly behaviour, negligence, indiscipline, misconduct, fraud, undue or unauthorized absence, erratic attendance, medically unfit, guilty of any other conduct considered by us detrimental to the interest of the Company, or of violation of one or more terms in this letter, incorrect information furnished by you or on suppression of any material information, you being adjudged an insolvent or applying to be adjudged an insolvent or making a composition or agreement with your creditors or being held guilty by competent court of any offence involving moral turpitude./n
                In either situation, you would be relieved subject to proper handover as directed by your immediate superior and subject to the following being provided to HR department:
                <ol>
                    <li>
                        Date of resignation
                    </li>
                    <li>
                        Last working date
                    </li>
                    <li>
                        Clearance certificate
                    </li>
                </ol>
            </li>
            <li>
            It would be deemed that you have forfeited your services in case of 7 or more continuous working days of leave/ absence from service that has not been discussed / approved in writing by your immediate superior or in case of failure to resume your duties within 3 days from the expiry of the duly authorized leave. Accordingly, your services shall stand terminated without notice or salary in lieu thereof.
            </li>
        </ol>
        <h4 class="section-title">7. Resignation and Termination of Services: </h4>

        <br/>

        <p>
            For <strong>AnandRathi IT Private Limited</strong>
        </p>

        <p><strong>Authorized Signatory</strong></p>

        <br/>

        <p>
            I accept the above terms and conditions.
        </p>

        <p>
            Employee Signature: _______________________<br/>
            Date: _______________________
        </p>

    </div>

    <div class="page-footer">
        Page <span class="page-number">1</span>
    </div>
</div>
`,


    other: `
<div class="page A4">
        <div class="page-header">
            <h4 class="offer-subtitle">Appointment Letter</h4>
        </div>

    <div class="page-body" contenteditable="true">

        <p>Hello <strong data-field="CandidateName">{{CandidateName}}</strong>,</p>

        <p>
            We are pleased to offer you employment as
            <strong data-field="Designation">{{Designation}}</strong> in the
            <strong data-field="Department">{{Department}}</strong> department at
            <strong data-field="Location">{{Location}}</strong>.
        </p>

        <h5>Compensation</h5>
        <table class="table table-bordered">
            <tr>
                <th>Total CTC</th>
                <td data-field="Salary">{{Salary}}</td>
            </tr>
        </table>

        <p>
            Your joining date will be
            <strong data-field="JoiningDate">{{JoiningDate}}</strong>.
        </p>

        <p>
            Best Wishes,<br/>
            <strong>Management</strong>
        </p>
    </div>
    <div class="page-footer">Page <span class="page-number">1</span></div>

</div>
`
};

function onCompanyTemplateChange() {

    const hasExistingContent =
        document.getElementById("OfferLetterId")?.value > 0;

    if (hasExistingContent) {
        alert("Template cannot be changed while editing an existing offer.");
        document.getElementById("companyTemplate").value = "default";
        return;
    }

    if (!confirm("Changing template will reset current content. Continue?")) {
        return;
    }

    const selected = document.getElementById("companyTemplate").value;
    document.getElementById("documentArea").innerHTML =
        offerTemplates[selected];
}

function format(command) {
    document.execCommand(command, false, null);
}
function changeFontFamily(font) {
    if (!font) return;
    document.execCommand("fontName", false, font);
}

function changeFontSize(size) {
    if (!size) return;
    document.execCommand("fontSize", false, size);
}
let currentFont = "Times New Roman";
let currentFontSize = "3";

function changeFontFamily(font) {
    currentFont = font;
    document.execCommand("fontName", false, font);
}

function changeFontSize(size) {
    currentFontSize = size;
    document.execCommand("fontSize", false, size);
}

document.addEventListener("keyup", function (e) {
    if (e.target.closest(".page-body")) {
        document.execCommand("fontName", false, currentFont);
        document.execCommand("fontSize", false, currentFontSize);
    }
});

function changePageSize() {
    var size = document.getElementById('pageSize').value;
    document.querySelectorAll('.page').forEach(p => {
        p.className = 'page ' + size;
    });
}

window.onload = function () {

    const saved = localStorage.getItem("offerLetterDraft");

    // If draft exists, load it
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById("documentArea").innerHTML = data.content;
        document.getElementById("pageSize").value = data.pageSize;
    }
};

function updatePageNumbers() {
    const pages = document.querySelectorAll(".page");
    pages.forEach((page, index) => {
        const numberEl = page.querySelector(".page-number");
        if (numberEl) numberEl.innerText = index + 1;
    });
}

// Call this whenever you add/remove pages
function addPage() {
    const pageSize = document.getElementById("pageSize").value;

    const firstPage = document.querySelector(".page");
    const headerHTML = firstPage.querySelector(".page-header").innerHTML;
    const footerHTML = firstPage.querySelector(".page-footer").innerHTML;

    const page = document.createElement("div");
    page.className = "page " + pageSize;

    page.innerHTML = `
        <div class="page-tools">
            <button onclick="removePage(this)">✖</button>
        </div>

        <div class="page-header">
            ${headerHTML}
        </div>

        <div class="page-body" contenteditable="true">
            <p><br/></p>
        </div>

        <div class="page-footer">
            ${footerHTML}
        </div>
    `;

    document.getElementById("documentArea").appendChild(page);
    updatePageNumbers();

    // Focus cursor into new page
    placeCaretAtStart(page.querySelector(".page-body"));
}

function removePage(btn) {
    const page = btn.closest('.page');
    if (document.querySelectorAll('.page').length === 1) {
        alert("At least one page is required");
        return;
    }
    page.remove();
    updatePageNumbers();
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

    insertHtmlAtCursor(html);

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

    formData.append("LetterBody",
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


/* ================= TABLE PICKER ================= */
var tablePicker = null;
var maxRows = 8;
var maxCols = 6;

document.addEventListener("DOMContentLoaded", function () {
    tablePicker = document.getElementById("tablePicker");
    if (tablePicker) {
        initTablePicker();
        attachTablePickerAutoClose();
    }
});

document.addEventListener("selectionchange", function () {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    var range = sel.getRangeAt(0);
    if (range.commonAncestorContainer.closest?.(".page")) {
        savedRange = range;
    }
});

function toggleTablePicker() {
    if (!tablePicker) return;
    tablePicker.classList.toggle("hidden");
}

/* Create grid */
function initTablePicker() {
    tablePicker.innerHTML = "";

    for (var r = 1; r <= maxRows; r++) {
        for (var c = 1; c <= maxCols; c++) {

            var cell = document.createElement("div");
            cell.className = "table-cell";
            cell.setAttribute("data-row", r);
            cell.setAttribute("data-col", c);

            cell.onmouseenter = (function (row, col) {
                return function () {
                    highlightCells(row, col);
                };
            })(r, c);

            cell.onclick = (function (row, col) {
                return function () {
                    insertTable(row, col);
                };
            })(r, c);

            tablePicker.appendChild(cell);
        }
    }
}

function clearTableHighlight() {
    document.querySelectorAll(".table-cell").forEach(cell => {
        cell.classList.remove("active");
    });
}

function attachTablePickerAutoClose() {
    if (!tablePicker) return;

    tablePicker.addEventListener("mouseleave", function () {
        tablePicker.classList.add("hidden");
        clearTableHighlight();
    });
}

/* Highlight selection */
function highlightCells(rows, cols) {
    var cells = document.querySelectorAll(".table-cell");
    cells.forEach(function (cell) {
        var r = cell.getAttribute("data-row");
        var c = cell.getAttribute("data-col");
        cell.classList.toggle("active", r <= rows && c <= cols);
    });
}

/* Insert table */
function insertTable(rows, cols) {

    var html = '<table class="table table-bordered"><tbody>';

    for (var r = 0; r < rows; r++) {
        html += '<tr>';
        for (var c = 0; c < cols; c++) {
            html += '<td>&nbsp;</td>';
        }
        html += '</tr>';
    }

    html += '</tbody></table><p><br/></p>';

    insertHtmlAtCursor(html);
    tablePicker.classList.add("hidden");
}

/* Insert at cursor */
function insertHtmlAtCursor(html) {

    var sel = window.getSelection();

    if (savedRange) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
    }

    if (!sel || sel.rangeCount === 0) return;

    var range = sel.getRangeAt(0);
    range.deleteContents();

    var el = document.createElement("div");
    el.innerHTML = html;

    var frag = document.createDocumentFragment();
    var lastNode = null;

    while (el.firstChild) {
        lastNode = frag.appendChild(el.firstChild);
    }

    range.insertNode(frag);

    // Move cursor AFTER inserted table
    if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRange = range;
    }
}

function getPageHeight(page) {
    return page.clientHeight;
}

function autoPaginateAllPages() {
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => paginatePage(page));
}

function paginatePage(page) {
    const pageBody = page.querySelector(".page-body");
    const pageHeight = page.clientHeight;
    const headerHeight = page.querySelector(".page-header").offsetHeight;
    const footerHeight = page.querySelector(".page-footer").offsetHeight;

    const maxBodyHeight = pageHeight - headerHeight - footerHeight;

    while (pageBody.scrollHeight > maxBodyHeight) {
        moveContentToNextPage(pageBody, maxBodyHeight);
    }
}

function placeCaretAtStart(el) {
    el.focus();

    const range = document.createRange();
    const sel = window.getSelection();

    let node = el.firstChild;
    while (node && node.nodeType !== Node.TEXT_NODE) {
        node = node.firstChild;
    }

    if (!node) {
        node = document.createTextNode("");
        el.appendChild(node);
    }

    range.setStart(node, 0);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);

    savedRange = range;
}

function moveContentToNextPage(pageBody, maxBodyHeight) {
    let nextPage = pageBody.parentElement.nextElementSibling;

    if (!nextPage || !nextPage.classList.contains("page")) {
        nextPage = createNewPageWithHeaderFooter();
        pageBody.parentElement.after(nextPage);
    }

    const nextBody = nextPage.querySelector(".page-body");

    let movedNode = null;

    while (pageBody.scrollHeight > maxBodyHeight) {
        movedNode = pageBody.lastElementChild;
        if (!movedNode) break;
        nextBody.prepend(movedNode);
    }

    placeCaretAtStart(nextBody);

    updatePageNumbers();
}

function createNewPageWithHeaderFooter() {
    const pageSize = document.getElementById("pageSize")?.value || "A4";

    const firstPage = document.querySelector(".page");
    const headerHTML = firstPage.querySelector(".page-header").innerHTML;
    const footerHTML = firstPage.querySelector(".page-footer").innerHTML;

    const page = document.createElement("div");
    page.className = "page " + pageSize;

    page.innerHTML = `
        <div class="page-tools">
            <button onclick="removePage(this)">✖</button>
        </div>

        <div class="page-header">
            ${headerHTML}
        </div>

        <div class="page-body" contenteditable="true">
            <p><br/></p>
        </div>

        <div class="page-footer">
            ${footerHTML}
        </div>
    `;

    return page;
}

function updatePageNumbers() {
    document.querySelectorAll(".page").forEach((page, index) => {
        page.querySelector(".page-number").innerText = index + 1;
    });
}

document.addEventListener("input", function (e) {
    if (e.target.closest(".page-body")) {
        autoPaginateAllPages();
    }
});
