'use strict';
/* global browser, tippy, getUserId, websiteInfoRender, misleadingLinkInfoRender */

startExtension();

async function startExtension() {
  const [userId, { options }, domainInfo] = await Promise.all([
    getUserId(),
    browser.storage.sync.get('options'),
    browser.runtime.sendMessage({ type: 'getDomainInfo' })
  ]);

  if (!domainInfo || domainInfo.isUnsupportedPage) {
    return;
  }

  if (options.excludedWebsitesRegex &&
    new RegExp(options.excludedWebsitesRegex, 'i').test(domainInfo.identDomain)) {
    return;
  }

/*  //targetSelectors are set to all inputs or passwords depending on the extensions settings.
  const targetSelectors = {
    input: 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])',
    password: 'input[type=password]'
  };*/

  const targetSelectors = {
    input: 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])',
    password: 'input[type=password]'
  };

  let target;
  if (domainInfo.alertedMode) {
    if (options && options.tooltipWarnings === 'off') {
      target = null;
    } else if (options && targetSelectors[options.tooltipWarnings]) {
      target = targetSelectors[options.tooltipWarnings];
    } else {
      target = targetSelectors.input;
    }
  } else {
    if (options && options.tooltipNoWarnings === 'off') {
      target = null;
    } else if (options && targetSelectors[options.tooltipNoWarnings]) {
      target = targetSelectors[options.tooltipNoWarnings];
    } else {
      target = null;
    }
  }

  // Wait for document.body to become available.
  await new Promise(resolve => {
    (function documentBodyReadyPromise() {
      if (!document.body) {
        setTimeout(documentBodyReadyPromise, 10);
        return;
      }

      resolve();
    })();
  });

  if (target) {
    const content = websiteInfoRender(domainInfo, userId, 'tooltip');
    setPhishingTooltip(target, content);
  }
}

function setPhishingTooltip(target, content) {
  let delegateInstance = null;
  let initialFocusTippyInstance = null;

  // tippy library created the speech bubble tooltip
  const tippyOptions = {
    content,
    allowHTML: true,
    trigger: 'focus',
    placement: 'right-end',
    zIndex: 2147483647, // maximum possible value
    interactive: true,
    appendTo: document.body,
    hideOnClick: false,
    theme: 'light-border',
    onClickOutside: instance => {
      return instance.hide()
    },
    onShown: () => {
      document.querySelectorAll('.zecops-anti-phishing-extension-dismiss').forEach(el => {
        el.addEventListener('click', event => {
          event.preventDefault();
          delegateInstance.destroy();
          if (initialFocusTippyInstance) {
            initialFocusTippyInstance.destroy();
          }
        });
      });
    },
    //onHide: () => false,
  };

  delegateInstance = tippy.delegate(document.body, {
    ...tippyOptions,
    target
  });

  if (document.activeElement && document.activeElement.matches(target)) {
    initialFocusTippyInstance = tippy(document.activeElement, {
      ...tippyOptions,
      showOnCreate: true
    });
  }
}
