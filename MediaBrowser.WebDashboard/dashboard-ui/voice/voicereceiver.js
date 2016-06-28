define(function () {
    var currentRecognition = null;
   

    /// <summary> Starts listening for voice commands </summary>
    /// <returns> . </returns>
    function listenForCommand( lang ) {
        return new Promise(function(resolve, reject) {
            destroyCurrentRecognition();
            var recognition = new (window.SpeechRecognition ||
                window.webkitSpeechRecognition ||
                window.mozSpeechRecognition ||
                window.oSpeechRecognition ||
                window.msSpeechRecognition)();
            recognition.lang = lang;
            //recognition.continuous = true;
            //recognition.interimResults = true;

            recognition.onresult = function (event) {
                console.log(event);
                if (event.results.length > 0) {
                    var resultInput = event.results[0][0].transcript || '';
                    resolve(resultInput);
                }
            };

            recognition.onerror = function() {
                reject({ error: event.error, message: event.message });
            };

            recognition.onnomatch = function() {
                reject({ error: "no-match" });
            };

            recognition.start();
            currentRecognition = recognition;
        });
    }

    /// <summary> Destroys the current recognition. </summary>
    /// <returns> . </returns>
    function destroyCurrentRecognition() {

        var recognition = currentRecognition;
        if (recognition) {
            recognition.abort();
            currentRecognition = null;
        }
    }

    /// <summary> Cancel listener. </summary>
    /// <returns> . </returns>
    function cancelListener() {

        destroyCurrentRecognition();
        
    }

    /// <summary> An enum constant representing the window. voice input manager option. </summary>
    return {
        listenForCommand: listenForCommand,
        cancel: cancelListener
    };

});