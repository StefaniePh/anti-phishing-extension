'use strict';

/* global ColorHash, CRC32 */

function toggleText() {
  // Get all the elements from the page
  var points =
    document.getElementById("points");
  var showMoreText =
    document.getElementById("learn-more-text");
  var buttonText =
    document.getElementById("learn-more-button");
  // If the display property of the dots to be displayed is already set to 'none' (that is hidden) then this section of code triggers
  if (points.style.display === "none") {
    // Hide the text between the span elements
    showMoreText.style.display = "none";
    // Show the dots after the text
    points.style.display = "inline";
    // Change the text on button to 'Show More'
    buttonText.innerHTML = "Show More";
  }
    // If the hidden portion is revealed, we will change it back to be hidden
  else {
    // Show the text between the span elements
    showMoreText.style.display = "inline";
    // Hide the dots after the text
    points.style.display = "none";
    // Change the text on button to 'Show Less'
    buttonText.innerHTML = "Show Less";
  }
}

function enableLogin() {
  console.log("enable login");
}

function websiteInfoRender(domainInfo, userId, renderTarget) {
  if (domainInfo.isUnsupportedPage) {
    return contentWrapper(`
      <div>
        This tab is not compatible with phishing protection.
      </div>
    `);
  }

  const domainName = domainInfo.identDomain;
  const warningCount = Object.keys(domainInfo.warnings).length;
  const t = escapeHtml;

  const content = `
    ${(warningCount === 0) ? '' : `
      <div class="zecops-anti-phishing-extension-tooltip-heading">
        ⚠️ WARNING<br>
        Times you've visited this website: ${domainInfo.visitCount}
      </div>
      <div class="zecops-anti-phishing-extension-tooltip-warnings">
        ${!domainInfo.warnings.smallVisitCount ? '' : `
          <div>
            If you think you have been on this website before, this one might be fake.<br>
            If you enter your credentials, they could be stolen.<br>
            <span id="points"></span>
            <span id="learn-more-text">
                Additional info<br>
                Additional Info<br>
            </span> 
            <button id="learn-more-button">Learn more</button>
            <br><br>
            <button id="back-button" onclick="history.back()">Go back (recommended)</button> 
            <button id="enable-button">Enable login</button>
          </div>
        `}
        ${!domainInfo.warnings.unicodeDomain ? '' : `
          <div>
            ${warningCount > 1 ? '• ' : ''}
            The domain name contains Unicode characters (${t(domainInfo.warnings.unicodeDomain).replace(
    /[^\x20-\x7e]+/ug,
    '<span class="zecops-anti-phishing-extension-tooltip-red">$&</span>'
  )}).
            Make sure that this is the website that you intended to visit.
          </div>
        `}
        ${!domainInfo.warnings.similarTopDomain ? '' : `
          <div>
            ${warningCount > 1 ? '• ' : ''}
            The domain name,
            <span class="zecops-anti-phishing-extension-tooltip-red">${t(domainName)}</span>,
            is visually similar to another domain of a popular website,
            <span class="zecops-anti-phishing-extension-tooltip-green">${t(domainInfo.warnings.similarTopDomain)}</span>.
          </div>
        `}
        ${!domainInfo.warnings.insecure ? '' : `
          <div>
            ${warningCount > 1 ? '• ' : ''}
            The connection to this website is not secure.
            Refrain from entering sensitive information, such as passwords
            or credit cards, on this site.
          </div>
        `}
      </div>
    `}
    ${!domainInfo.isPopular ? '' : `
      <div>
        <span class="zecops-anti-phishing-extension-tooltip-green">
          ✔
        </span>
        <strong>${t(domainName)}</strong> is a well known website.
      </div>
    `}
  `;

  /*  const content = `
      ${(warningCount === 0) ? '' : `
        <div class="zecops-anti-phishing-extension-tooltip-heading">
          ⚠️ Warning: Times you've visited this website: ${domainInfo.visitCount}
        </div>
        <div class="zecops-anti-phishing-extension-tooltip-warnings">
          ${!domainInfo.warnings.smallVisitCount ? '' : `
            <div>
              If you think you have been on this website before, this one might be fake.<br>
              If you enter your credentials, they could be stolen.<br>
             <span id="points">...</span>
              <span id="moreText">
                  Additional info
              </span>
              <button onclick="toggleText()" id="textButton">
                  Show More
              </button>
              <br>
              <button id="back-button" onclick="history.back()">Go back (recommended)</button>
              <button id="enable-button" onclick="history.back()">Enable login</button>
              <!--<button id="enable-button" onclick="history.back()">Enable</button>-->
            </div>
          `}
          ${!domainInfo.warnings.unicodeDomain ? '' : `
            <div>
              ${warningCount > 1 ? '• ' : ''}
              The domain name contains Unicode characters (${t(domainInfo.warnings.unicodeDomain).replace(
      /[^\x20-\x7e]+/ug,
      '<span class="zecops-anti-phishing-extension-tooltip-red">$&</span>'
    )}).
              Make sure that this is the website that you intended to visit.
            </div>
          `}
          ${!domainInfo.warnings.similarTopDomain ? '' : `
            <div>
              ${warningCount > 1 ? '• ' : ''}
              The domain name,
              <span class="zecops-anti-phishing-extension-tooltip-red">${t(domainName)}</span>,
              is visually similar to another domain of a popular website,
              <span class="zecops-anti-phishing-extension-tooltip-green">${t(domainInfo.warnings.similarTopDomain)}</span>.
            </div>
          `}
          ${!domainInfo.warnings.insecure ? '' : `
            <div>
              ${warningCount > 1 ? '• ' : ''}
              The connection to this website is not secure.
              Refrain from entering sensitive information, such as passwords
              or credit cards, on this site.
            </div>
          `}
        </div>
      `}
      ${!domainInfo.isPopular ? '' : `
        <div>
          <span class="zecops-anti-phishing-extension-tooltip-green">
            ✔
          </span>
          <strong>${t(domainName)}</strong> is a well known website.
        </div>
      `}
    `;*/

  return contentWrapper(content);
}

function contentWrapper(content) {
  return `
    <div class="zecops-anti-phishing-extension-tooltip">
      ${content}
    </div>
  `;
}

// https://stackoverflow.com/a/6234804
// Modified (added '/') per Mozilla reviewer request.
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
