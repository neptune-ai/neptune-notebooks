define([
    'jquery',
    'base/js/namespace',
    'base/js/events',
    'base/js/dialog'
    ], function($, Jupyter, events, dialog) {
    var NEPTUNE_LOGO_URL = 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAYAAACZ3F9/AAAABHNCSVQICAgIfAhkiAAAAN5JREFUKJHF0K9Lw0EcxvGXc07ZEJTJBIOrBothJsHmLAOLMLQJ/lNGu0E2ozKDJoMIgqIOy0wiIiZ/MIOfLxzD7B74cHfvu+eezx3DUg4HOEMx4WM4xgXGBw1QxxIm0Ej2N1CJy9ZT40iMe3jFE5axFXwfN/jCAnYGW73GJlbQS/g91rCKh7/e+IJqtPSJOUyjjxlM4hvlqMt8GOfxHvMr1GLdxXPw2+B9TI0G/EjSFyOljDe0gtf8ft5sdv4I7cTYwGMkNBO+jbv4j104jMqUwzlOIyFTASfooOTf9QMT5SpplgZyIQAAAABJRU5ErkJggg==\')';

    var uniqueComponentId = 0;

    var globalApiAddress = null;
    var globalAccessToken = null;
    var globalUsername = null;

    var projects = [];
    var notebook = null;

    var uploadTimer = new Timer();
    var configTimer = new Timer();

    var CURRENT_VERSION = '0.0.10';

    return {
        'load_jupyter_extension': loadJupyterExtensions,
        'load_ipython_extension': loadJupyterExtensions
    };

    function initialize() {
        $([IPython.events]).on('kernel_ready.Kernel', function() {
            injectNotebookId();
        });
        var buttonGroup = $(Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register ({
                help   : 'Connect to Neptune',
                icon   : 'fa-check',
                handler: showConfigModal
            }, 'neptune_notebooks', 'neptune_notebook'),
            Jupyter.keyboard_manager.actions.register ({
                help   : 'Upload to Neptune',
                icon   : 'fa-cloud-upload',
                label  : 'Upload',
                handler: createCheckpoint
            }, 'neptune_notebooks', 'neptune_notebook_upload')
        ]));
        $(buttonGroup
            .find('button')[0])
            .attr('id', 'neptune-authorize-btn');

        $(buttonGroup
            .find('button')[1])
            .attr('id', 'neptune-upload-btn');

        $(buttonGroup)
            .find('#neptune-authorize-btn')
            .css('background', NEPTUNE_LOGO_URL + ' 7px 4px no-repeat')
            .css('min-width', '30px')
            .find('i')
            .removeClass('fa-check');

        $(buttonGroup)
            .find('#neptune-upload-btn')
            .append(' Upload');

        if (!window.localStorage.getItem('neptune_api_token') || !getNotebookId()) {
            $(buttonGroup).find('#neptune-authorize-btn')
                .css('padding-left', '24px')
                .append($('<span class=\'text\'> Configure</span>'));
            $(buttonGroup).find('#neptune-upload-btn').hide();
        } else {
            $(buttonGroup).find('#neptune-upload-btn').show();
        }

        $(buttonGroup)
            .append('<div class=\'popup\' id=\'neptune-upload-status\' style=\'display: none\'></div>')
            .append('<div class=\'popup\' id=\'neptune-authorize-status\' style=\'display: none\'></div>');

        $(buttonGroup)
            .find('#neptune-upload-status, #neptune-authorize-status')
            .css({
                'margin-left': '29px',
                'margin-top': '23px',
                'font-weight': 'normal',
                'vertical-align': 'middle',
                'background-image': 'none',
                'border': '1px solid transparent',
                'padding': '6px 12px',
                'border-radius': '2px',
                'color': '#333',
                'background-color': '#fff',
                'border-color': '#ccc',
                'max-width': '260px',
                'position': 'absolute',
                'z-index': '10',
                'white-space': 'normal',
                'text-align': 'left',
                'width': '260px'
            });

        $(buttonGroup)
            .find('#neptune-authorize-status')
            .css('margin-left', '0px');

        injectUpgradeNotice();
        checkForNewestVersion();
    }

    function injectUpgradeNotice() {
        var upgradeNotice = $('<div id="neptune-upgrade-notice"></div>')
            .css({
                'position': 'fixed',
                'display': 'flex',
                'background': '#FFF8E5',
                'bottom': '25px',
                'right': '25px',
                'padding': '10px',
                'max-width': '320px'
            });

        var icon = $('<i />')
            .addClass('fa fas fa-exclamation-triangle fa-lg')
            .css({
                'margin-top': '5px',
                'color': '#FFBF00',
            });

        var text = $('<p>New version of neptune-notebooks is now available! To upgrade, use this command:</p>')
            .css({
                'padding': '0 10px',
                'font-size': '12px',
                'color': '#333'
            });

        var command = $('<p>pip install -U neptune-notebooks</p>')
            .css({
                'background': 'white',
                'font-family': 'monospace',
                'margin-top': '10px',
                'padding': '5px',
            });

        var close = $('<i />')
            .addClass('fa fas fa-times-circle fa-lg')
            .css({
                'color': '#ccc',
                'margin-top': '5px',
                'cursor': 'pointer',
            })
            .click(function() {
                upgradeNotice.hide();
            });

        upgradeNotice.append(
            icon,
            text.append(command),
            close,
        );

        $('body').append(upgradeNotice.hide());
    }

    function checkForNewestVersion() {
        const apiAdress = window.localStorage.getItem('neptune_api_address');
        // Disable for on prem installations
        if (apiAdress && !apiAdress.endsWith('neptune.ml')) {
            return;
        }

        $.ajax({
            url: 'https://pypi.org/pypi/neptune-notebooks/json',
            success: function (data) {
                const latestVersion = Object.keys(data.releases).sort().pop();
                if (CURRENT_VERSION !== latestVersion) {
                    $('#neptune-upgrade-notice').show();
                }
            },
            catch: function () {},
        })
    }

    function getAccessToken(status, apiToken, callback, errorCallback) {
        var decodedToken = {};
        try {
            decodedToken = JSON.parse(atob(apiToken));
        } catch(error) {
            status && status.clear();
            if (apiToken) {
                status && status.fail('Api token is not valid');
            } else {
                status && status.clear();
            }
            if (typeof errorCallback === 'function') {
                errorCallback(error);
            }
            return false;
        }

        status && status.spin();

        $.ajax({
            url: decodedToken.api_address + '/api/backend/v1/authorization/oauth-token',
            type: 'GET',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Neptune-Api-Token', apiToken);
            },
            success: function(data) {
                globalApiAddress = decodedToken.api_address;
                globalAccessToken = data.accessToken;
                globalUsername = data.username;
                window.localStorage.setItem('neptune_api_address', decodedToken.api_address);
                status && status.ok();
                callback(decodedToken.api_address, data.accessToken, data.username);
            },
            error: function() {
                if (typeof errorCallback === 'function') {
                    errorCallback();
                }
                status && status.fail('Api token is not valid');
                return false;
            }
        });
    }

    function getUserProjects(status, apiAddress, accessToken, callback) {
        status.spin();

        $.ajax({
            url: apiAddress + '/api/backend/v1/projects?userRelation=memberOrHigher',
            type: 'GET',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            },
            success: function(projectData) {
                projects = projectData.entries;
                callback(projectData);
            },
            error: function() {
                status.fail('Unable to download user projects');
            }
        });
    }

    function getNotebookData(status, apiAddress, accessToken, notebookId, username, callback, errorCallback) {
        status && status.spin();
        $.ajax({
            url: apiAddress + '/api/leaderboard/v1/notebooks/' + notebookId,
            type: 'GET',
            beforeSend: function(xhr){
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            },
            success: function(nbData) {
                var jupyterPath = IPython.notebook.notebook_path;
                notebook = nbData;
                if (!nbData) {
                    return false;
                }

                var projectId = $('#neptune-project').val();
                if (projectId && nbData.projectId !== projectId) {
                    status && status.fail('You changed the project');
                    return callback(nbData);
                }

                if (nbData.owner !== username) {
                    status && status.fail('You are not the owner of this notebook. You need to create your own copy');
                    return callback(nbData);
                }

                if (nbData.path !== jupyterPath) {
                    status && status.warn('Notebook was previously uploaded under different path');
                    return callback(nbData);
                }

                status && status.ok();
                callback(nbData);
            },
            error: function(nbData) {
                status && status.clear();
                if (typeof errorCallback === 'function') {
                    errorCallback(nbData);
                }
            }
        })
    }

    function requestCreateCheckpoint(status, apiAdress, accessToken, callback, errorCallback) {
        var body = JSON.stringify(IPython.notebook.toJSON());
        var jupyterPath = IPython.notebook.notebook_path;
        var nbId = IPython.notebook.metadata.neptune.notebookId;
        $.ajax({
            url: apiAdress + '/api/leaderboard/v1/notebooks/'+nbId+'/checkpoints?jupyterPath=' + encodeURIComponent(jupyterPath),
            method: 'POST',
            data: body,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            },
            contentType: 'application/octet-stream',
            success: function(data) {
                successNbSave(data);
                status && status.ok();
                if (typeof callback === 'function') {
                    callback(data);
                }
                updateNotebookLinks(data, apiAdress);
            },
            error: function(data) {
                var errorText;
                if (data.status === 422) {
                    errorText = 'Storage limit has been reached. Checkpoint can\'t be uploaded. ';
                }
                errorNbSave(data, errorText);
                status && status.fail('Failed to create new notebook, please try again');
                if (typeof errorCallback === 'function') {
                    errorCallback(data);
                }
            }
        });
    }

    function requestCreateNotebook(status, api_address, accessToken, projectId, callback, errorCallback) {
        var currentProjectId = projectId || $('#neptune-project').val();
        $.ajax({
            url: api_address + '/api/leaderboard/v1/notebooks?projectIdentifier=' + currentProjectId,
            method: 'POST',
            data: '{}',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            },
            contentType: 'application/octet-stream',
            success: function(data) {
                IPython.notebook.metadata.neptune = {
                    notebookId: data.id
                };
                IPython.notebook.save_checkpoint();
                injectNotebookId();
                createCheckpoint(callback, errorCallback, true);
            },
            error: function(data) {
                errorNbSave(data);
                if (typeof errorCallback === 'function') {
                    errorCallback(data);
                }
                status.fail('Failed to create new notebook, please try again');
            }
        });
    }

    function showConfirmationModal(apiAddress, accessToken, projectId, title, callback, errorCallback) {
        var element = dialog.modal({
            show: false,
            title: title,
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,
            body: renderConfirmationModal(apiAddress, accessToken, projectId, getNotebookId(), function() {return element;}, callback, errorCallback)
        }).attr('id', 'neptune_modal');
        element.find('.neptune-popup-closer').prepend(
            $('<i/>')
                .addClass('fa fa-lg')
        );
        element.find('.modal-footer').hide();
        element.modal('show');
    }

    function renderConfirmationModal(apiAddress, accessToken, projectId, notebookId, modalProvider, callback, errorCallback) {
        var popupBody = $('<div id=\'neptune-upload-ext\' />');

        var form = $('<form/>')
            .addClass('form-horizontal');

        var text = $('<div />')
            .text('How would you like to continue?');

        var checkpointRadio = createRadio('create-checkpoint', 'Continue working with the same notebook', true);
        var notebookRadio = createRadio('create-notebook', 'Create new notebook in Neptune', false);

        var buttons = $('<div/>')
            .css({
                'display': 'flex',
                'justify-content': 'flex-end'
            })
            .append(
                makeButton('Cancel', function () {
                    modalProvider().modal('hide');
                    return false;
                })
                    .css('margin-right', '10px')
            )
            .append(
                makeButton('Apply', function () {
                    if ($('#upload-create-checkpoint').prop('checked')) {
                        requestCreateCheckpoint(null, apiAddress, accessToken, callback, errorCallback);
                    } else {
                        requestCreateNotebook(null, apiAddress, accessToken, projectId, callback, errorCallback);
                    }
                    modalProvider().modal('hide');
                    return false;
                })
                    .addClass('btn-primary')
            );

        form
            .append(text)
            .append(checkpointRadio)
            .append(notebookRadio)
            .append(buttons)
            .children('div')
            .addClass('form-group');

        popupBody
            .append(form);

        return popupBody;

        function createRadio(name, label, checked) {
            const id = 'upload-' + name;
            return $('<div/>')
                .append(
                    $('<input type=\'radio\' name=\'uploadRadio\'/>')
                        .attr('id', id)
                        .val(name)
                        .prop('checked', checked)
                        .addClass('form-check-input col-sm-1')
                ).append(
                    $('<label/>')
                        .attr('for', id)
                        .text(label)
                        .addClass('form-check-label col-sm-11')
                );
        }
    }

    function showConfigModal(callback) {
        var modal;

        var apiTokenStatus = new Status();
        var projectSelectStatus = new Status();
        var notebookCreationStatus = new Status();

        var apiToken = window.localStorage.getItem('neptune_api_token') || '';
        var notebookId = getNotebookId();

        modal = dialog.modal({
            show: false,
            title: 'Configure connection to Neptune',
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,
            body: renderConfigModal(apiTokenStatus, projectSelectStatus, notebookCreationStatus, apiToken, notebookId, function() { return modal;}, callback),
        }).attr('id', 'neptune_modal');

        modal.find('.neptune-popup-closer')
            .prepend(
                $('<i/>')
                    .addClass('fa fa-lg')
            )
            .prop('disabled', true);

        modal.find('.modal-footer').hide();
        modal.modal('show');
    }


    function renderConfigModal (apiTokenStatus, projectSelectStatus, notebookCreationStatus, initialApiToken, initialNotebookId, modalProvider) {
        var modalBody = $('<div id=\'neptune-notebook-ext\' />')
            .css('min-height', '300px');

        var NUMBER_SIZE = '36px';

        var step1 = $('<div id=\'tab1\' />').hide();
        var step2 = $('<div id=\'tab2\' />').hide();

        var step1Form = createStep1Form();
        var step2Form = createStep2Form();

        step1.append(step1Form);
        step2.append(step2Form);

        apiTokenStatus.clear();
        projectSelectStatus.clear();
        notebookCreationStatus.clear();

        var tokenInput = $('<div/>')
            .append(makeLabel('neptune-api-token', 'Api Token'))
            .append(
                $('<div/>')
                    .addClass('col-sm-11')
                    .append(
                        $('<input id=\'neptune-api-token\' type=\'text\' />')
                            .addClass('form-control')
                            .val(initialApiToken)
                            .data('oldVal', initialApiToken)
                            .bind('change click keyup input paste', function() {
                                if ($(this).data('oldVal') !== $(this).val()) {
                                    $(this).data('oldVal', $(this).val());
                                    validate(apiTokenStatus, projectSelectStatus, notebookCreationStatus);
                                }
                            })
                    ).append(apiTokenStatus.errorElem)
            )
            .append(apiTokenStatus.elem);

        var projectInput = $('<div/>')
            .append(makeLabel('neptune-project', 'Select project'))
            .append(
                $('<div/>')
                    .addClass('col-sm-11')
                    .append(
                        $('<select/>')
                            .addClass('form-control')
                            .css('margin-left', '0px')
                            .attr('id', 'neptune-project')
                            .bind('change click keyup input paste', function() {
                                if ($(this).data('oldVal') !== $(this).val()) {
                                    $(this).data('oldVal', $(this).val());
                                    if ($(this).val() === 'invalidProject') {
                                        projectSelectStatus.fail('You don\'t have write access to this project');
                                    } else {
                                        projectSelectStatus.ok();
                                    }
                                    validate(apiTokenStatus, projectSelectStatus, notebookCreationStatus);
                                }
                            })
                    )
                    .append(projectSelectStatus.errorElem)
            )
            .append(projectSelectStatus.elem);


        var errorText = $('<div id=\'error-create-notebook\'>An error occured, please try again.</div>')
            .css({
                'color': 'red',
                'display': 'flex',
                'justify-content': 'flex-end'
            })
            .hide();

        var step1Buttons = $('<div/>')
            .css({
                'display': 'flex',
                'justify-content': 'flex-end'
            })
            .append(
                makeButton('Cancel', function () {
                    modalProvider().modal('hide');
                    return false;
                })
                    .css('margin-right', '10px')
            )
            .append(
                makeButton('Create notebook', function (event) {
                    errorText.hide();
                    createNotebook(notebookCreationStatus, globalApiAddress, globalAccessToken, globalUsername, function() {
                        updateTextArea();
                        configSave();
                        setStep('step2');
                    }, function (error) {
                        var text;
                        if (error.status === 422) {
                            text = 'Storage limit has been reached. Notebook can\'t be created.';
                        } else {
                            text = 'An error occured, please try again.';
                        }
                        errorText.text(text);
                        errorText.show();
                    });
                    event.stopPropagation();
                    return false;
                })
                    .addClass('btn-primary')
            );

        step1Form
            .append(tokenInput)
            .append(projectInput)
            .append(errorText)
            .append(step1Buttons);

        var integrationCode = $('<div/>')
            .append($('<div/>')
                .addClass('col-sm-12')
                .append($('<textarea id=\'neptune-integration-area\' rows=\'5\' disabled />')
                    .addClass('form-control')
                    .css({
                        'resize': 'none',
                        'white-space': 'pre',
                        'overflow': 'auto'
                    })
                )
            );

        var step2Buttons = $('<div/>')
            .css({
                'display': 'flex',
                'justify-content': 'flex-end'
            })
            .append(
                makeButton('Cancel', function () {
                    modalProvider().modal('hide');
                    return false;
                })
                    .css('margin-right', '10px')
            )
            .append(
                makeButton('Integrate', function () {
                    IPython.notebook.kernel.execute($('#neptune-integration-area').val());
                    modalProvider().modal('hide');
                    return false;
                })
                    .addClass('btn-primary')
            );

        step2Form
            .append(integrationCode)
            .append(step2Buttons);

        $([step1Form, step2Form]).each(function() {
            this
                .children('div')
                .addClass('form-group');
        });

        modalBody
            .append(step1)
            .append(step2);

        fetchData(apiTokenStatus, projectSelectStatus, notebookCreationStatus);

        return modalBody;

        function validate(tokenStatus, projectStatus, notebookStatus) {
            var apiToken = modalBody.find('#neptune-api-token').val();
            try {
                JSON.parse(atob(apiToken))
            } catch(error) {
                tokenStatus.clear();
                tokenStatus.fail('Api token is not valid');
                globalApiAddress = null;
                globalAccessToken = null;
                globalUsername = null;
                return false;
            }
            getAccessToken(tokenStatus, apiToken, function(apiAddress, accessToken, username) {
                window.localStorage.setItem('neptune_api_token', apiToken);
                globalApiAddress = apiAddress;
                globalAccessToken = accessToken;
                globalUsername = username;
                getUserProjects(projectStatus, apiAddress, accessToken, function(projectData) {
                    var currentProjectId = $('#neptune-project').val();
                    fillProjectSelectBox(projectStatus, currentProjectId, projectData);
                    getNotebookData(notebookStatus, apiAddress, accessToken, initialNotebookId, username, function(nbData) {});
                })
            }, function () {
                setStep('step1');
            });
            return false;
        }

        function createStep2Form() {
            var step2Header = createStep2Header();

            var subtitle2 = $('<div />')
                .addClass('col-sm-12')
                .css({
                    'color': '#68b84c',
                    'font-size': '16px',
                    'font-weight': '600',
                    'margin-bottom': '20px'
                })
                .append('Initial checkpoint successful! Check ')
                .append(
                    $('<a>this link</a>')
                        .addClass('notebook-link')
                )
                .append(' to see your notebook ' + IPython.notebook.notebook_name);

            var subtitle3 = $('<div />')
                .addClass('col-sm-12')
                .css('font-size', '13px')
                .text('Integrate to create Neptune experiments and see them all linked to this notebook. ' +
                    ' Click \'Integrate\' to run the code below.');

            return createForm()
                .append(step2Header)
                .append(subtitle2)
                .append(subtitle3);
        }

        function createStep1Form() {
            var step1Header = createStep1Header();

            var step1Text = $('<div/>')
                .addClass('col-sm-12')
                .text('API token and Project allows you to checkpoint and share your work in Neptune.');

            return createForm()
                .append(step1Header)
                .append(step1Text);
        }

        function createStep2Header() {
            return createHeader()
                .append(createStepTitle()
                    .css('cursor', 'pointer')
                    .append($('<i/>')
                        .addClass('fa fa-2x fa-check-circle')
                        .css({
                            'color': '#68b84c',
                            'border': '1px solid transparent',
                            'border-radius': '50%',
                            'width': NUMBER_SIZE
                        })
                    )
                    .append(createStepTitleText('Checkpoint')
                        .css({
                            'color': '#68b84c',
                            'vertical-align': 'super'
                        })
                    )
                    .click(function () { setStep('step1') })
                )
                .append(createDivider())
                .append(createStepTitle()
                    .append(createStepNumber(2))
                    .append(createStepTitleText('Integration'))
                );
        }

        function createStep1Header() {
            return createHeader()
                .append(createStepTitle()
                    .append(createStepNumber(1))
                    .append(createStepTitleText('Checkpoint'))
                )
                .append(createDivider())
                .append(createStepTitle()
                    .append(createStepNumber(2)
                        .css('background-color', '#d8d8d8')
                    )
                    .append(createStepTitleText('Integration')
                        .css('color', '#d8d8d8')
                    )
                );
        }

        function createDivider() {
            return $('<div/>')
                .addClass('col-sm-4')
                .css({
                    'background-color': '#d8d8d8',
                    'height': '1px',
                });
        }

        function createStepTitleText(text) {
            return $('<span>' + text + '</span>')
                .css({
                    'margin-left': '10px',
                    'color': '#337ab7',
                });
        }

        function createStepTitle() {
            return $('<div/>')
                .addClass('col-sm-4')
                .css({
                    'font-size': '17px',
                    'font-weight': 'bold',
                    'text-align': 'center',
                });
        }

        function createHeader() {
            return $('<div/>')
                .css({
                    'display': 'flex',
                    'align-items': 'center',
                    'margin-bottom': '20px',
                });
        }

        function createForm() {
            return $('<form/>')
                .addClass('form-horizontal')
                .css('padding', '0 20px')
        }

        function createStepNumber(number) {
            return $('<span>' + number + '</span>')
                .css({
                    'display': 'inline-block',
                    'background-color': '#337ab7',
                    'color': '#fff',
                    'border': '1px solid transparent',
                    'border-radius': '50%',
                    'line-height': NUMBER_SIZE,
                    'width': NUMBER_SIZE,
                    'height': NUMBER_SIZE,
                });
        }

        function fetchData(tokenStatus, projectStatus, notebookStatus) {
            getAccessToken(tokenStatus, initialApiToken, function(apiAddress, accessToken, username) {
                getUserProjects(projectStatus, apiAddress, accessToken, function(projectData) {
                    function handleNotAuthorized() {
                        fillProjectSelectBox(projectStatus, null, projectData);
                        updateTextArea();
                        setStep('step1');
                    }

                    if (getNotebookId()) {
                        getNotebookData(notebookStatus, apiAddress, accessToken, getNotebookId(), username, function(nbData) {
                            if (nbData.owner !== username) {
                                handleNotAuthorized();
                                return;
                            }
                            fillProjectSelectBox(projectStatus, nbData.projectId, projectData);
                            updateTextArea();
                            updateNotebookLinks(nbData, apiAddress);
                            setStep('step2')
                        }, handleNotAuthorized)
                    } else {
                        handleNotAuthorized();
                    }
                })
            }, function () {
                setStep('step1');
            });
            return false;
        }

        function setStep(step) {
            if (step === 'step1') {
                step1.show();
                step2.hide();
            } else {
                step1.hide();
                step2.show();
            }
        }
    }

    function createNotebook(status, api_address, accessToken, username, callback, errorCallback) {
        status.spin();
        getNotebookData(status, api_address, accessToken, getNotebookId(), username, function(nbData) {
            var currentProjectId = $('#neptune-project').val();
            if (currentProjectId !== nbData.projectId) {
                showConfirmationModal(api_address, accessToken, null, 'Your notebook\'s project has changed.', callback, errorCallback);
            } else if (nbData.owner === username) {
                showConfirmationModal(api_address, accessToken, null, 'No changes detected', callback, errorCallback);
            } else {
                requestCreateNotebook(status, api_address, accessToken, null, callback, errorCallback);
            }
        }, function () {
            requestCreateNotebook(status, api_address, accessToken, null, callback, errorCallback);
        })
    }

    function createCheckpoint(callback, errorCallback, force) {
        duringNbSave();

        var initialApiToken = window.localStorage.getItem('neptune_api_token') || '';

        getAccessToken(null, initialApiToken, function(apiAddress, accessToken, username) {
            var jupyterPath = IPython.notebook.notebook_path;
            if (getNotebookId()) {
                getNotebookData(null, apiAddress, accessToken, getNotebookId(), username, function(nbData) {
                    if (!nbData) {
                        return errorNbSave(null, 'You don\'t have access to this notebook, details in configuration');
                    }

                    if (nbData.owner !== username) {
                        return requestCreateNotebook(null, apiAddress, accessToken, nbData.projectId , callback, errorCallback);
                    }

                    if (nbData.path !== jupyterPath) {
                        showConfirmationModal(apiAddress, accessToken, nbData.projectId, 'Your notebook\'s path has changed.', callback, errorCallback);
                        return errorNbSave(null, 'Notebook was previously uploaded under different path');
                    }

                    requestCreateCheckpoint(null, apiAddress, accessToken, callback, errorCallback);
                }, function () {
                    if (force) {
                        requestCreateCheckpoint(null, apiAddress, accessToken, callback, errorCallback);
                    } else {
                        return errorNbSave(null, 'Your notebook does not exist, details in configuration');
                    }
                })
            } else {
                errorNbSave(null, 'Notebook is not associated to Neptune, details in configuration');
            }
        }, function (error) {
            errorNbSave(null, 'Wrong token provided, details in configuration');
            if (typeof errorCallback === 'function') {
                errorCallback(error)
            }
        });
    }

    function getNotebookId() {
        var neptuneMetadata = IPython.notebook.metadata.neptune;
        if (neptuneMetadata && neptuneMetadata.notebookId) {
            return neptuneMetadata.notebookId;
        }
        return null;
    }

    function injectNotebookId() {
        var notebookId = getNotebookId();
        if (notebookId) {
            IPython.notebook.kernel.execute('' +
                'import os\n' +
                'os.environ[\'NEPTUNE_NOTEBOOK_ID\']=\'' + notebookId + '\'\n'
            );
        }
    }

    function fillProjectSelectBox(status, selectedProjectId, projectData) {
        var currentProject = selectedProjectId;
        var projectIdentifiers = projectData.entries.map(function(row) {
            return row.id;
        });
        var projectIdsWithNames = projectData.entries.map(function(row) {
            return [row.id, row.organizationName + '/' + row.name];
        });
        $('#neptune-project option').remove();
        $.each(projectIdsWithNames, function (i, item) {
            $('#neptune-project').append($('<option>', {
                value: item[0],
                text : item[1]
            }));
        });
        if (projectIdentifiers.indexOf(currentProject) >= 0) {
            $('#neptune-project').val(currentProject);
            status.ok();
        } else {
            if (currentProject) {
                $('#neptune-project')
                    .append($('<option>', {
                        value: 'invalidProject',
                        text : 'Undisclosed project'
                    }))
                    .val('invalidProject');
                status.fail('You don\'t have write access to this project');
            } else {
                status.ok();
            }
        }

    }

    function updateTextArea() {
        $('#neptune-integration-area').val('' +
            'import os\n' +
            'os.environ[\'NEPTUNE_API_TOKEN\']=\'' + $('#neptune-api-token').val() + '\'\n' +
            'os.environ[\'NEPTUNE_PROJECT\']=\'' + $('#neptune-project option:selected').text() + '\'\n' +
            'os.environ[\'NEPTUNE_NOTEBOOK_ID\']=\'' + getNotebookId() + '\'\n');
    }

    function configReset() {
        $('#neptune-authorize-btn')
            .css('background', NEPTUNE_LOGO_URL + ' 7px 4px no-repeat')
            .find('i')
            .removeClass()
            .addClass('fa')
            .css({
                'color': 'black',
                'padding-right': '0'
            });


        $('#neptune-authorize-status')
            .hide();
    }

    function configSave() {
        var authorizeButton = $('#neptune-authorize-btn');

        authorizeButton
            .css('padding-left', '8px')
            .find('.text').remove();

        $('#neptune-upload-btn').show();

        authorizeButton
            .css('background', NEPTUNE_LOGO_URL + ' 27px 4px no-repeat')
            .find('i')
            .removeClass()
            .addClass('fa fa-check-circle')
            .css({
                'color': 'green',
                'padding-right': '20px'
            });

        $('#neptune-authorize-status')
            .text('Configuration completed!')
            .show();

        configTimer.start(configReset);
    }

    function nbSaveButtonReset() {
        $('#neptune-upload-btn')
            .find('i')
            .removeClass()
            .addClass('fa')
            .css('color', 'black');
    }

    function idleNbSave() {
        uploadTimer.stop();
        nbSaveButtonReset();
        $('#neptune-upload-status')
            .hide();

        $('#neptune-upload-btn')
            .prop('disabled', false)
            .find('i')
            .addClass('fa-cloud-upload');
    }

    function duringNbSave() {
        uploadTimer.stop();
        nbSaveButtonReset();

        $('#neptune-upload-btn')
            .prop('disabled', true)
            .find('i')
            .addClass('fa-spin fa-spinner');
    }

    function successNbSave() {
        nbSaveButtonReset();
        $('#neptune-upload-btn')
            .prop('disabled', false)
            .find('i').addClass('fa-check-circle').css('color', 'green');
        $('#neptune-upload-status')
            .text('Successfully uploaded! To see notebook in Neptune, go to ')
            .append(
                $('<a>link</a>')
                    .addClass('notebook-link')
            )
            .show();
        uploadTimer.start(idleNbSave);
        updateNotebookLinks();
    }

    function errorNbSave(data, statusText) {
        nbSaveButtonReset();
        $('#neptune-upload-btn')
            .prop('disabled', false).find('i')
            .addClass('fa-times-circle')
            .css('color', 'red');

        if (data && data.status === 403) {
            $('#neptune-upload-status')
                .text('Failed to upload notebook. You are not authorized to upload to this notebook.')
                .show();
        } else {
            $('#neptune-upload-status')
                .text(statusText || 'An error occurred while uploading, please try again.')
                .show();
        }
        uploadTimer.start(idleNbSave);
    }

    function makeLabel(forAttr, text) {
        return $('<label/>')
            .addClass('col-sm-2')
            .attr('for', forAttr)
            .text(text);
    }

    function makeButton(text, callback) {
        return $('<button/>')
            .addClass('btn')
            .text(text)
            .click(callback);
    }

    function loadJupyterExtensions() {
        return Jupyter.notebook.config.loaded.then(initialize);
    }


    function updateNotebookLinks(notebook, apiAddress) {
        $('.notebook-link')
            .attr('target', '__blank')
            .attr('rel', 'noopener noreferrer')
            .attr('href', makeNotebookUrl(notebook, apiAddress));
    }

    function makeNotebookUrl(notebook, apiAddress) {
        if (!notebook) {
            return null;
        }

        var project = projects.find(function (project) {
            return project.id === notebook.projectId;
        });

        return apiAddress + '/' + project.organizationName + '/' + project.name + '/n/' +
            notebook.name + '-' + notebook.id + '/' + notebook.lastCheckpointId;
    }

    function Timer() {
        return {
            handle: 0,
            start: function(fun) {
                this.stop();
                this.handle = setTimeout(fun, 4000);
            },
            stop: function() {
                if (this.handle) {
                    clearTimeout(this.handle);
                    this.handle = 0;
                }
            }
        };
    }

    function Status() {
        uniqueComponentId += 1;
        var statusIsOk = false;
        var e = $('<div />').addClass('col-sm-1');
        var handlers = [];
        var errorArea = $('<div class=\'help-block\'>neptune-status-' + uniqueComponentId + '</div>')
            .css('color', 'red');

        e.prepend($('<i/>')
            .addClass('fa fa-2x fa-question-circle')
            .css('margin-top', '2px')
            .css('margin-left', '20px')
            .css('color', 'black')
        );
        var img = e.find('i');

        return {
            elem: e,
            errorElem: errorArea,
            ok: makeOk,
            spin: makeSpin,
            fail: makeFail,
            warn: makeWarn,
            clear: reset,
            isOk: checkOk,
            add: addHandler
        };

        function checkOk() {
            return statusIsOk;
        }

        function reset() {
            img.removeClass();
            statusIsOk = false;
            errorArea.hide();
        }

        function fireHandlers() {
            handlers.forEach(function(ee) {
                ee.validate();
            });
        }

        function makeOk() {
            reset();
            errorArea.hide();
            statusIsOk = true;
            img
                .addClass('fa fa-2x fa-check-circle')
                .css('color', 'green');
            fireHandlers();
        }

        function makeWarn(statusText) {
            reset();
            errorArea.text(statusText);
            errorArea.show();
            statusIsOk = true;
            img
                .addClass('fa fa-2x fa-exclamation-circle')
                .css('color', 'orange');
            fireHandlers();
        }

        function makeSpin() {
            reset();
            errorArea.hide();
            img
                .addClass('fa fa-2x fa-spin fa-spinner')
                .css('color', 'black');
            fireHandlers();
        }

        function makeFail(statusText) {
            reset();
            errorArea.text(statusText);
            errorArea.show();
            img
                .addClass('fa fa-2x fa-times-circle')
                .css('color', 'red');
            fireHandlers();
        }

        function addHandler(handler) {
            handlers.push(handler);
        }
    }
});

