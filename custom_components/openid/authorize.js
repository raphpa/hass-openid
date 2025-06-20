const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  if (!args[0].includes('/auth/login_flow')) {
    return response;
  }

  // Got the first response from /auth/login_flow
  // Restore the original fetch function
  window.fetch = originalFetch;

  const responseBody = await response.clone().json();
  console.log('Response from /auth/login_flow:', responseBody);

  const authFlow = document.getElementsByClassName('card-content')[0];

  const listNode = document.createElement('ha-list');
  const listItemNode = document.createElement('ha-list-item');
  listItemNode.setAttribute('hasmeta', '');
  listItemNode.setAttribute('mwc-list-item', '');
  listItemNode.innerHTML = 'OpenID / OAuth2 Authentication <ha-icon-next slot="meta"></ha-icon-next>';
  listItemNode.onclick = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = encodeURIComponent(urlParams.get('client_id'));
    const redirectUri = encodeURIComponent(urlParams.get('redirect_uri'));
    const baseUrl = window.location.origin;

    const encodedUrl = encodeURIComponent(`/auth/openid/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&base_url=${baseUrl}`);
    window.location.href = decodeURIComponent(encodedUrl);
  };

  listNode.appendChild(listItemNode);
  authFlow.append(listNode);

  const alertType = localStorage.getItem('alertType');
  const alertMessage = localStorage.getItem('alertMessage') || 'No error message provided';

  if (alertType) {
    const alertNode = document.createElement('ha-alert');
    alertNode.setAttribute('alert-type', alertType);
    alertNode.textContent = alertMessage.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    authFlow.prepend(alertNode);
    localStorage.removeItem('alertType');
    localStorage.removeItem('alertMessage');
  }

  return response;
};
