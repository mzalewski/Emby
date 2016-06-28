define(['dialogHelper', 'jQuery', 'voice/voicereceiver', 'paper-button'], function (dialogHelper, $, voicereceiver) {

    var currentRecognition;
    var lang = 'en-US';
    var commandgroups = null;

    /// <summary> Shuffle array. </summary>
    /// <param name="array"> The array. </param>
    /// <returns> array </returns>
    function shuffleArray(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /// <summary> Gets sample commands. </summary>
    /// <returns> The sample commands. </returns>
    function getSampleCommands(groupid) {
        
        return voicereceiver.getCommandGroups().then(function (commandGroups) {
            groupid = typeof (groupid) !== 'undefined' ? groupid : '';

            var commands = [];
            commandGroups.map(function (group) {
                if ((group.items && group.items.length > 0) && (groupid == group.groupid || groupid == '')) {

                    group.items.map(function (item) {

                        if (item.commandtemplates && item.commandtemplates.length > 0) {

                            item.commandtemplates.map(function (templates) {
                                commands.push(templates);
                            });
                        }

                    });
                }
            });

            return shuffleArray(commands);
        });
    }

    /// <summary> Gets command group. </summary>
    /// <param name="groupid"> The groupid. </param>
    /// <returns> The command group. </returns>
    function getCommandGroup(groupid) {
        return voicereceiver.getCommandGroups()
            .then(function(commandgroups) {
                if (commandgroups) {
                    var idx = -1;
                    
                    idx = commandgroups.map(function(e) { return e.groupid; }).indexOf(groupid);

                    if (idx > -1)
                        return commandgroups[idx];
                    else
                        return null;
                } else
                    return null;
            });
    }

    /// <summary> Renders the sample commands. </summary>
    /// <param name="elem"> The element. </param>
    /// <param name="commands"> The commands. </param>
    /// <returns> . </returns>
    function renderSampleCommands(elem, commands) {

        commands.length = Math.min(commands.length, 4);

        commands = commands.map(function (c) {

            return '<div class="exampleCommand"><span class="exampleCommandText">"' + c + '"</span></div>';

        }).join('');

        $('.exampleCommands', elem).html(commands);
    }

    var currentDialog;
    /// <summary> Shows the voice help. </summary>
    /// <returns> . </returns>
    function showVoiceHelp(groupid, title) {
        console.log("Showing Voice Help", groupid, title);
        var isNewDialog = false;
        if (!currentDialog) {
            isNewDialog = true;
        var dlg = dialogHelper.createDialog({
            size: 'medium',
            removeOnClose: true
        });

        dlg.classList.add('ui-body-b');
        dlg.classList.add('background-theme-b');

        var html = '';
        html += '<h2 class="dialogHeader">';
        html +=
            '<paper-fab icon="arrow-back" mini class="btnCancelVoiceInput"></paper-fab><span id="voiceDialogGroupName"></span>';

        html += '</h2>';

        html += '<div>';


        html += '<div class="voiceHelpContent">';

        html += '<div class="defaultVoiceHelp">';

        html += '<h1 style="margin-bottom:1.25em;">' + Globalize.translate('HeaderSaySomethingLike') + '</h1>';

        html += '<div class="exampleCommands">';
        html += '</div>';

        // defaultVoiceHelp
        html += '</div>';

        html += '<div class="unrecognizedCommand" style="display:none;">';
        html += '<h1>' + Globalize.translate('HeaderYouSaid') + '</h1>';
        html +=
            '<p class="exampleCommand voiceInputContainer"><i class="fa fa-quote-left"></i><span class="voiceInputText exampleCommandText"></span><i class="fa fa-quote-right"></i></p>';
        html += '<p>' + Globalize.translate('MessageWeDidntRecognizeCommand') + '</p>';

        html += '<br/>';
        html += '<paper-button raised class="submit block btnRetry"><iron-icon icon="mic"></iron-icon><span>' +
            Globalize.translate('ButtonTryAgain') +
            '</span></paper-button>';
        html += '<p class="blockedMessage" style="display:none;">' +
            Globalize.translate('MessageIfYouBlockedVoice') +
            '<br/><br/></p>';

        html += '</div>';

        html +=
            '<paper-button raised class="block btnCancelVoiceInput" style="background-color:#444;"><iron-icon icon="close"></iron-icon><span>' + Globalize.translate('ButtonCancel') + '</span></paper-button>';

        // voiceHelpContent
        html += '</div>';

        html += '</div>';

        dlg.innerHTML = html;
        document.body.appendChild(dlg);
    
        dialogHelper.open(dlg);
        currentDialog = dlg;

        dlg.addEventListener('close', function () {
            currentDialog = null;
        });

        $('.btnCancelVoiceInput', dlg).on('click', function () {
            voicereceiver.cancel();
            dialogHelper.close(dlg);
        });

        $('.btnRetry', dlg).on('click', function () {
            $('.unrecognizedCommand').hide();
            $('.defaultVoiceHelp').show();
            listen();
        });
        }

        if (groupid) {
            getCommandGroup(groupid)
                .then(
                    function(grp) {
                        $('#voiceDialogGroupName').text('  ' + grp.name);
                    });


            getSampleCommands(groupid)
                .then(function(commands) {
                    renderSampleCommands(currentDialog.querySelector('.voiceHelpContent'), commands);
                    listen();
                })
                .catch(function(e) { console.log("Error", e); });
        } else if (isNewDialog) {
            getSampleCommands()
                .then(function(commands) {
                    renderSampleCommands(currentDialog.querySelector('.voiceHelpContent'), commands);
                });

        }
    }

    /// <summary> Hides the voice help. </summary>
    /// <returns> . </returns>
    function hideVoiceHelp() {

        $('.voiceInputHelp').remove();
    }

    /// <summary> Shows the unrecognized command help. </summary>
    /// <returns> . </returns>
    function showUnrecognizedCommandHelp() {
        //speak("I don't understend this command");
        $('.unrecognizedCommand').show();
        $('.defaultVoiceHelp').hide();
    }

    /// <summary> Shows the commands. </summary>
    /// <param name="createUI"> The create user interface. </param>
    /// <returns> . </returns>
    function showCommands( result) {
        //speak('Hello, what can I do for you?');
        require(['paper-fab', 'css!voice/voice.css'], function () {
            if (result)
                showVoiceHelp(result.groupid, result.name);
            else
                showVoiceHelp();
        });
        
    }

    /// <summary> Speaks the given text. </summary>
    /// <param name="text"> The text. </param>
    /// <returns> . </returns>
    function speak(text) {

        if (!SpeechSynthesisUtterance) {
            console.log('API not supported');
        }

        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.addEventListener('end', function () {
            console.log('Synthesizing completed');
        });

        utterance.addEventListener('error', function (event) {
            console.log('Synthesizing error');
        });

        console.log('Synthesizing the text: ' + text);
        speechSynthesis.speak(utterance);
    }

    function showDialog() {
        $('.unrecognizedCommand').hide();
        $('.defaultVoiceHelp').show();

        showCommands();
        listen();
    }
    function listen() {
        voicereceiver.listenForCommand(lang).then(function (data) {
            cancelDialog();
        }, function (result) {
            console.log("Result received by voice dialog", result);
            if (result.error == 'group') {
                showVoiceHelp(result.item.groupid, result.groupName);
                return;
            }
            if (result.text !== undefined)
                $('.voiceInputText').html(result.text);
            showUnrecognizedCommandHelp();
        });
    }
    function cancelDialog() {
        hideVoiceHelp();

    }

    /// <summary> An enum constant representing the window. voice input manager option. </summary>
    return {
        showDialog: showDialog
    };

});