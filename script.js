const WEBHOOK_URL = "https://morsmatias.app.n8n.cloud/webhook/job-tracker";

const form = document.getElementById("job-form");
const submitBtn = document.getElementById("submit-btn");
const msgLoading = document.getElementById("msg-loading");
const msgSuccess = document.getElementById("msg-success");
const msgError = document.getElementById("msg-error");

// Show one message, hide the others
function showMessage(which) {
    msgLoading.hidden = true;
    msgSuccess.hidden = true;
    msgError.hidden = true;
    if (which) which.hidden = false;
}

// Add or remove red border on a field
function validate(input, condition) {
    input.classList.toggle("input-error", !condition);
    return condition;
}

// Validate all required fields and formats
function validateForm() {
    const company = document.getElementById("company");
    const role = document.getElementById("role");
    const url = document.getElementById("url");
    const date = document.getElementById("date");
    const status = document.getElementById("status");
    const email = document.getElementById("email");

    const urlPattern = /^https?:\/\/.+\..+/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return [
        validate(company, company.value.trim() !== ""),
        validate(role, role.value.trim() !== ""),
        validate(url, urlPattern.test(url.value.trim())),
        validate(date, date.value !== ""),
        validate(status, status.value !== ""),
        validate(email, emailPattern.test(email.value.trim())),
    ].every(Boolean);
}

// Package form values into a plain object
function getFormData() {
    return {
        company: document.getElementById("company").value.trim(),
        role: document.getElementById("role").value.trim(),
        url: document.getElementById("url").value.trim(),
        date: document.getElementById("date").value,
        status: document.getElementById("status").value,
        notes: document.getElementById("notes").value.trim(),
        email: document.getElementById("email").value.trim(),
    };
}

// POST data to n8n as JSON
async function sendToWebhook(data) {
    const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response;
}

// Clear all fields and error states
function resetForm() {
    form.reset();
    document.querySelectorAll(".input-error")
        .forEach(el => el.classList.remove("input-error"));
}

// Enable or disable all fields
function setFormDisabled(disabled) {
    document.querySelectorAll("input, select, textarea")
        .forEach(field => field.disabled = disabled);
}

// Clear red border as soon as user starts typing
document.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
        field.classList.remove("input-error");
    });
});

// Handle form submission
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showMessage(null);

    if (!validateForm()) {
        showMessage(msgError);
        msgError.textContent = "Please fix the highlighted fields.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    showMessage(msgLoading);
    setFormDisabled(true);

    try {
        await sendToWebhook(getFormData());
        showMessage(msgSuccess);
        resetForm();
        setTimeout(() => msgSuccess.hidden = true, 4000);

    } catch (error) {
        console.error("Webhook error:", error);
        showMessage(msgError);
        msgError.textContent = "Something went wrong. Please try again.";

    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
        setFormDisabled(false);
    }
});