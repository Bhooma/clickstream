// Define the ClickstreamTracker object
var ClickstreamTracker = (function() {
    // Private variables
    var clickstream = [];

    // Function to track clicks
    function trackClick(event) {
        var target = event.target || event.srcElement;
        clickstream.push({
            timestamp: new Date(),
            elementId: target.id,
            tagName: target.tagName
        });
    }

    // Public method to send clickstream data to backend
    function sendToBackend(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (callback) callback(null, xhr.responseText);
                } else {
                    if (callback) callback("Error: " + xhr.status);
                }
            }
        };
        xhr.send(JSON.stringify(clickstream));
    }

    // Listen for click events on document
    document.addEventListener('click', trackClick);

    // Public methods
    return {
        sendToBackend: sendToBackend
    };
})();

// Example: Send clickstream data to backend
document.addEventListener('click', function() {
    ClickstreamTracker.sendToBackend('https://example.com/track-clicks', function(err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log("Clickstream data sent successfully:", response);
        }
    });
});
