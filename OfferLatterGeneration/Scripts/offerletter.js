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
    <h3 class="offer-subtitle">Offer of Employment</h3>

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
`,

    arit: `
<div class="page A4" contenteditable="true">
    <h3 class="company-title">Anand Rathi IT PVT. LTD.</h3>
    <h5 class="offer-subtitle">Offer Letter</h5>

    <p>
        Dear <strong data-field="CandidateName">{{CandidateName}}</strong>,
    </p>

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
        Regards,<br />
        <strong>ARIT HR Team</strong>
    </p>
</div>
`,

    other: `
<div class="page A4" contenteditable="true">
    <h4 class="offer-subtitle">Appointment Letter</h4>

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

function addPage() {
    const pageSize = document.getElementById('pageSize').value;

    const page = document.createElement('div');
    page.className = 'page ' + pageSize;
    page.setAttribute('contenteditable', 'true');

    page.innerHTML = `
        <div class="page-tools">
            <button onclick="removePage(this)" title="Remove Page">✖</button>
        </div>
        <p><br/></p>
    `;

    document.getElementById('documentArea').appendChild(page);
}

function removePage(btn) {
    const page = btn.closest('.page');
    if (document.querySelectorAll('.page').length === 1) {
        alert("At least one page is required");
        return;
    }
    page.remove();
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
