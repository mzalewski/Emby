define(function () {

    var commandgroups;

    function getCommandGroups() {

        if (commandgroups) {
            return Promise.resolve(commandgroups);
        }

        return new Promise(function (resolve, reject) {

            var file = "grammar";
            //if (language && language.length > 0)
            //    file = language;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', "voice/grammar/" + file + ".json", true);

            xhr.onload = function (e) {

                commandgroups = JSON.parse(this.response);
                resolve(commandgroups);
            }

            xhr.onerror = reject;

            xhr.send();
        });
    }
    /// <summary> Process the transcript described by text. </summary>
    /// <param name="text"> The text. </param>
    /// <returns> . </returns>
    function processTranscript(text) {
        return new Promise(function(resolve, reject) {
            if (text) {
                require(['voice/voicecommands.js', 'voice/grammarprocessor.js'],
                    function(voicecommands, grammarprocessor) {

                        var processor = grammarprocessor(commandgroups, text);
                        if (processor && processor.command) {
                            console.log("Command from Grammar Processor", processor);
                            voicecommands(processor)
                                .then(function(result) {
                                    console.log("Result of executed command", result);
                                    if (result.item.actionid === 'show' && result.item.sourceid === 'group') {
                                        reject({ error: "group", item: result.item, groupName: result.name });
                                    } else {
                                        resolve({ item: result.item });
                                    }
                                })
                                .catch(function() {
                                    reject({ error: "unrecognized-command", text: text });
                                });
                        } else {
                            reject({ error: "unrecognized-command", text: text });
                        }

                    });

            } else {
                reject({ error: "empty" });
            }
        });
    }

    /// <summary> An enum constant representing the window. voice input manager option. </summary>
    return {
        processTranscript: processTranscript,
        getCommandGroups: getCommandGroups
    };

});