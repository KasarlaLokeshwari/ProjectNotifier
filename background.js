chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const url = new URL(details.url);
      const submissionId = url.pathname.split('/').pop();
  
      if (url.pathname.includes('/submit/complete/')) {
        chrome.storage.local.get(submissionId, (result) => {
          if (!result[submissionId]) {
            const csrfToken = details.requestHeaders.find(header => header.name === 'x-csrf-token').value;
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, {action: "getProblemDetails"}, (response) => {
                if (response) {
                  chrome.storage.local.set({
                    [submissionId]: {
                      csrfToken: csrfToken,
                      problemName: response.problemName,
                      problemId: response.problemId
                    }
                  });
                  checkResult(submissionId, csrfToken);
                }
              });
            });
          }
        });
      }
    },
    {urls: ["*://www.codechef.com/submit/complete/*"]},
    ["requestHeaders"]
  );
  
  function checkResult(submissionId, csrfToken) {
    chrome.storage.local.get(submissionId, (result) => {
      if (result[submissionId]) {
        const {problemName, problemId} = result[submissionId];
        fetch(`https://www.codechef.com/api/submission-status/${submissionId}`, {
          method: 'GET',
          headers: {
            'x-csrf-token': csrfToken
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.verdict) {
            chrome.notifications.create('', {
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'CodeChef Verdict Available',
              message: `Verdict for ${problemName} is available: ${data.verdict}`
            });
          } else {
            setTimeout(() => checkResult(submissionId, csrfToken), 10000);
          }
        })
        .catch(error => console.error('Error:', error));
      }
    });
  }
  