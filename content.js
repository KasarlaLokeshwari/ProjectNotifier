chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getProblemDetails") {
      const problemName = document.querySelector('.problem-statement h1').textContent.trim();
      const problemId = window.location.pathname.split('/').pop();
      sendResponse({problemName: problemName, problemId: problemId});
    }
  });
  