/* =========================================================
   legal.js · Ventanas legales y gestión de cookies.
   ========================================================= */

/* =========================================================
   VENTANAS MODALES LEGALES Y COOKIES
   ========================================================= */
function setupModal(triggerId, modalId, closeId, backdropId) {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    const close = document.getElementById(closeId);
    const backdrop = document.getElementById(backdropId);

    if (trigger && modal) {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        });

        const closeModal = () => {
            modal.classList.remove("active");
            document.body.style.overflow = document.querySelector(".cart-modal.active") ? "hidden" : "";
        };

        if (close) close.addEventListener("click", closeModal);
        if (backdrop) backdrop.addEventListener("click", closeModal);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                closeModal();
            }
        });
    }
}

setupModal("openLegalModal", "legalModal", "closeLegalModal", "legalBackdrop");
setupModal("openPrivacyModal", "privacyModal", "closePrivacyModal", "privacyBackdrop");
setupModal("openPrivacyFromOrder", "privacyModal", "closePrivacyModal", "privacyBackdrop");
setupModal("openCookiesModal", "cookiesModal", "closeCookiesModal", "cookiesBackdrop");

const bannerCookiesLink = document.getElementById("bannerCookiesLink");
if (bannerCookiesLink) {
    bannerCookiesLink.addEventListener("click", (e) => {
        e.preventDefault();
        const cookiesModal = document.getElementById("cookiesModal");
        if (cookiesModal) {
            cookiesModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    });
}

/* =========================================================
   GESTIÓN DEL BANNER Y CONFIGURACIÓN DE COOKIES
   ========================================================= */
const cookieBanner = document.getElementById("cookieBanner");
const btnAcceptCookies = document.getElementById("btnAcceptCookies");
const btnRejectCookies = document.getElementById("btnRejectCookies");
const btnConfigCookies = document.getElementById("btnConfigCookies");
const openCookieConfigFooter = document.getElementById("openCookieConfig");
const modalCookieConfigTrigger = document.getElementById("modalCookieConfigTrigger");

const cookiePreference = localStorage.getItem("gastrognomo_cookie_consent");
if (!cookiePreference && cookieBanner) {
    cookieBanner.style.display = "block";
}

function setCookieConsent(status) {
    localStorage.setItem("gastrognomo_cookie_consent", status);
    if (cookieBanner) cookieBanner.style.display = "none";
}

if (btnAcceptCookies) btnAcceptCookies.addEventListener("click", () => setCookieConsent("accepted"));
if (btnRejectCookies) btnRejectCookies.addEventListener("click", () => setCookieConsent("rejected"));

const showConfigAction = (e) => {
    if (e) e.preventDefault();
    if (cookieBanner) cookieBanner.style.display = "block";
    const cookiesModal = document.getElementById("cookiesModal");
    if (cookiesModal && cookiesModal.classList.contains("active")) {
        cookiesModal.classList.remove("active");
        document.body.style.overflow = "";
    }
};

if (btnConfigCookies) btnConfigCookies.addEventListener("click", showConfigAction);
if (openCookieConfigFooter) openCookieConfigFooter.addEventListener("click", showConfigAction);
if (modalCookieConfigTrigger) modalCookieConfigTrigger.addEventListener("click", showConfigAction);
