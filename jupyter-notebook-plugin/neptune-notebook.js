define([
    'jquery',
    'base/js/namespace',
    'base/js/events',
    'base/js/dialog'
    ], function($, Jupyter, events, dialog) {

    var initialize = function () {
        console.debug("initializing neptune")
        $([IPython.events]).on("kernel_ready.Kernel", function() {
            var apiToken = window.localStorage.getItem('neptune_api_token') || ''
            var project = window.localStorage.getItem('neptune_project') || ''
            injectNotebookId()
            if (apiToken && project) {
                console.debug("Neptune - kernel is ready - initializing neptune client in notebook")
            } else {
                console.debug("Neptune - kernel is ready - not configured")
            }
        });
        $([IPython.events]).on("notebook_saved.Notebook", function(dane) {
            console.debug("notebook saved")
        });
        var buttonGroup = $(Jupyter.toolbar.add_buttons_group([
            Jupyter.keyboard_manager.actions.register ({
                help   : 'Connect to Neptune',
                icon   : 'fa-check',
                handler: show_neptune_popup
            }, 'neptune_notebooks', 'neptune_notebook'),
            Jupyter.keyboard_manager.actions.register ({
                help   : 'Upload to Neptune',
                icon   : 'fa-cloud-upload',
                label  : 'Upload',
                handler: save_notebook_in_neptune
            }, 'neptune_notebooks', 'neptune_notebook_upload')
        ]));
        $(buttonGroup.find("button")[0]).attr("id", "neptune-authorize-btn")
        $(buttonGroup.find("button")[1]).attr("id", "neptune-upload-btn")

        $(buttonGroup).find("#neptune-authorize-btn").find("i").removeClass("fa-check")
        $(buttonGroup).find("#neptune-authorize-btn").css("background", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAYAAACZ3F9/AAAABHNCSVQICAgIfAhkiAAAAN5JREFUKJHF0K9Lw0EcxvGXc07ZEJTJBIOrBothJsHmLAOLMLQJ/lNGu0E2ozKDJoMIgqIOy0wiIiZ/MIOfLxzD7B74cHfvu+eezx3DUg4HOEMx4WM4xgXGBw1QxxIm0Ej2N1CJy9ZT40iMe3jFE5axFXwfN/jCAnYGW73GJlbQS/g91rCKh7/e+IJqtPSJOUyjjxlM4hvlqMt8GOfxHvMr1GLdxXPw2+B9TI0G/EjSFyOljDe0gtf8ft5sdv4I7cTYwGMkNBO+jbv4j104jMqUwzlOIyFTASfooOTf9QMT5SpplgZyIQAAAABJRU5ErkJggg==') 7px 4px no-repeat")
        $(buttonGroup).find("#neptune-authorize-btn").css("min-width", "30px")
        $(buttonGroup).find("#neptune-upload-btn").append(" Upload")

        if (! (window.localStorage.getItem('neptune_api_token') || '') || !getNotebookId()) {
          $(buttonGroup).find("#neptune-authorize-btn").css("padding-left", "24px")
          $(buttonGroup).find("#neptune-authorize-btn").append(" Configure");
          $(buttonGroup).find("#neptune-upload-btn").hide();
        } else {
          $(buttonGroup).find("#neptune-upload-btn").show();
        }

        $(buttonGroup)
            .append('<div class="popup" id="neptune-upload-status" style="display: none"></div>')

        $(buttonGroup).find("#neptune-upload-status")
            .css("margin-left", "29px")
            .css("margin-top", "23px")
            .css("font-weight", "normal")
            .css("text-align", "center")
            .css("vertical-align", "middle")
            .css("background-image", "none")
            .css("border", "1px solid transparent")
            .css("padding", "6px 12px")
            .css("border-radius", "2px")
            .css("color", "#333")
            .css("background-color", "#fff")
            .css("background-image", "none")
            .css("border-color", "#ccc")
            .css("width", "260px")
            .css("max-width", "260px")
            .css("position", "absolute")
            .css("z-index", "10")
            .css("white-space", "normal")
            .css("text-align", "left")

    };

    function getNotebookId() {
        var neptuneMetadata = IPython.notebook.metadata.neptune
        if (neptuneMetadata && neptuneMetadata.notebookId) {
            return neptuneMetadata.notebookId
        }
        return null
    }

    function injectNotebookId() {
        if (getNotebookId()) {
            IPython.notebook.kernel.execute("" +
                "import os\n" +
                "os.environ['NEPTUNE_NOTEBOOK_ID']='" + getNotebookId() + "'\n"
            )
        }

    }

    function createCheckpoint(status, api_address, accessToken) {
        var body = JSON.stringify(IPython.notebook.toJSON())
        var jupyterPath = IPython.notebook.notebook_path
        var nbId = IPython.notebook.metadata.neptune.notebookId
        $.ajax({
            url: api_address + "/api/leaderboard/v1/notebooks/"+nbId+"/checkpoints?jupyterPath=" + jupyterPath,
            method: "POST",
            data: body,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
            },
            contentType: "application/octet-stream",
            success: function(data) {
                successNbSave(data)
                if (status) {
                    status.ok()
                }
            },
            error: function(data) {
                console.error("Neptune failed to create new notebook checkpoint")
                errorNbSave(data)
                if (status) {
                    status.fail("Failed to create new notebook, please try again")
                }
            }
        });
    }

    function createNotebook(status, api_address, accessToken, projectId) {
        var jupyterPath = IPython.notebook.notebook_path
        var currentProjectId = projectId || $("#neptune-project").val()
        $.ajax({
            url: api_address + "/api/leaderboard/v1/notebooks?projectIdentifier=" + currentProjectId,
            method: "POST",
            data: "{}",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
            },
            contentType: "application/octet-stream",
            success: function(data) {
                console.debug("Created notebook")
                IPython.notebook.metadata.neptune = {
                  notebookId: data.id
                }
                IPython.notebook.save_checkpoint()
                injectNotebookId()
                createCheckpoint(status, api_address, accessToken)
            },
            error: function(data) {
                console.error("Neptune failed to create new notebook")
                errorNbSave(data)
                status.fail("Failed to create new notebook, please try again")
            }
        });
    }

    var idleTimer = {
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

    function nbSaveButtonReset() {
        $("#neptune-upload-btn").find("i").removeClass().addClass("fa").css("color", "black")
    }

    function idleNbSave() {
        idleTimer.stop()
        nbSaveButtonReset()
        $("#neptune-upload-status")
            .hide()
        $("#neptune-upload-btn").prop("disabled", false)
        $("#neptune-upload-btn").find("i").addClass("fa-cloud-upload")
    }
    function duringNbSave() {
        idleTimer.stop()
        nbSaveButtonReset()
        $("#neptune-upload-btn").prop("disabled", true)
        $("#neptune-upload-btn").find("i").addClass("fa-spin fa-spinner")
    }

    function successNbSave(data) {
        nbSaveButtonReset()
        $("#neptune-upload-btn").prop("disabled", false)
        $("#neptune-upload-btn").find("i").addClass("fa-check-circle").css("color", "green")
        $("#neptune-upload-status")
            .text("Successfully uploaded! To see notebook in Neptune, go to ")
            .append("<a>link</a>")
            .show()
        idleTimer.start(idleNbSave)
    }

    function errorNbSave(data, statusText) {
        nbSaveButtonReset()
        $("#neptune-upload-btn").prop("disabled", false)
        $("#neptune-upload-btn").find("i").addClass("fa-times-circle").css("color", "red")
        if (data && data.status == 403) {
            $("#neptune-upload-status")
                .text("Failed to upload notebook. You are not authorized to upload to this notebook.")
                .show()
        } else {
            $("#neptune-upload-status")
                .text(statusText || "An error occurred while uploading, please try again.")
                .show()
        }
        idleTimer.start(idleNbSave)
    }

    function save_notebook_in_neptune_with_tokens(status, api_address, accessToken, username) {
        status.spin()
        // user decided to upload this notebook. It doesn't matter if notebook existed previously
        createNotebook(status, api_address, accessToken)
    }

    function save_checkpoint_in_neptune_with_tokens(status, api_address, accessToken, username) {
        var metadata = IPython.notebook.metadata
        // get existing notebook
        status.spin()
        if (metadata.neptune && metadata.neptune.notebookId) {

            $.ajax({
                url: api_address + "/api/leaderboard/v1/notebooks/" + metadata.neptune.notebookId,
                type: "GET",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                },
                success: function(nbData) {
                    console.debug(nbData)
                    var jupyterPath = IPython.notebook.notebook_path
                    if (nbData && nbData.owner == username) {
                        // user decided to upload a checkpoint - it doesnt matter if paths differ
                        createCheckpoint(status, api_address, accessToken)
                    } else {
                        // new owner - new notebook
                        status.fail("You are not the owner of this notebook in Neptune. You need to create a new notebook in Neptune")
                    }
                },
                error: function(nbData) {
                    status.fail("You don't have access to this notebook in Neptune. You need to create a new notebook in Neptune")
                }
            })
        } else {
            status.fail("You must first create a notebook in Neptune in order to upload checkpoints")
        }
    }


    function save_notebook_in_neptune() {
        duringNbSave()
        var initialApiToken = window.localStorage.getItem('neptune_api_token') || ''

        getAccessToken(null, initialApiToken, function(apiAddress, accessToken, username) {
            var jupyterPath = IPython.notebook.notebook_path
            if (getNotebookId()) {
                getNotebookData(null, apiAddress, accessToken, getNotebookId(), username, function(nbData) {

                    if (nbData) {
                        if (nbData.owner == username) {
                            if (nbData.path == jupyterPath) {
                                createCheckpoint(null, apiAddress, accessToken)
                            } else {
                                show_upload_popup(apiAddress, accessToken, nbData.projectId)
                                errorNbSave(null, "Notebook was previously uploaded under different path")
                            }
                        } else {
                            errorNbSave(null, "You are not the owner of this notebook. You need to create your own copy, details in configuration")
                        }
                    } else {
                        errorNbSave(null, "You don't have access to this notebook, details in configuration")
                    }



                })
            } else {
                errorNbSave(null, "Notebook is not associated to Npetune, details in configuration")
            }
        });
    }

    function makeLabel(forAttr, text) {
        return $('<label/>')
            .addClass('col-sm-2 control-label')
            .css('padding-right', '1em')
            .attr('for', forAttr)
            .text(text)
    }

    var counter = 0
    function makeStatus() {
        counter += 1
        var statusIsOk = false
        var e = $('<div />').addClass('col-sm-1')
        var handlers = []
        var errorArea = $('<div class="help-block">neptune-status-'+counter+'</div>')
        e.prepend($('<i/>')
            .addClass('fa fa-2x fa-question-circle')
            .css("margin-top", "2px")
            .css("margin-left", "20px")
            .css("color", "black")
        )
        var img = e.find("i")

        var checkOk = function () {
          return statusIsOk
        }

        function reset() {
            img.removeClass()
            statusIsOk = false
            errorArea.hide()
        }

        function fireHandlers() {
            handlers.forEach(function(ee) {
                ee.validate()
            })
        }

        var makeOk = function() {
            reset()
            errorArea.hide()
            statusIsOk = true
            img.addClass('fa fa-2x fa-check-circle').css("color", "green")
            fireHandlers()
        }

        var makeWarn = function(statusText) {
            reset()
            errorArea.text(statusText)
            errorArea.show()
            statusIsOk = true
            img.addClass('fa fa-2x fa-exclamation-circle').css("color", "orange")
            fireHandlers()
        }

        var makeSpin = function() {
            reset()
            errorArea.hide()
            img.addClass('fa fa-2x fa-spin fa-spinner').css("color", "black")
            fireHandlers()
        }

        var makeFail = function(statusText) {
            reset()
            errorArea.text(statusText)
            errorArea.show()
            img.addClass('fa fa-2x fa-times-circle').css("color", "red")
            fireHandlers()
        }

        var addHandler = function(handler) {
            handlers.push(handler)
        }

        return { elem: e, errorElem: errorArea, ok: makeOk, spin: makeSpin, fail: makeFail, warn: makeWarn, clear: reset, isOk: checkOk, add: addHandler}
    }

    function handleButton(statuses) {
        function makeRevalidate() {
            var valid = true
            for (var status in statuses) {
                valid = valid && statuses[status].isOk()
            }
            var acceptButton = $('#neptune_modal').find('.neptune-popup-closer')
            acceptButton.prop('disabled', !valid)
            updateTextArea()
        }

        return {validate: makeRevalidate}
    }
    function handleUploadOptionsButtons(tokenStatus, projectStatus, notebookStatus) {
        function makeRevalidate() {
            var valid = tokenStatus.isOk() && projectStatus.isOk()
            var newNotebookButton = $('#neptune-create-notebook')
            var newCheckpointButton = $('#neptune-create-checkpoint')
            newNotebookButton.prop('disabled', !valid)
            newCheckpointButton.prop('disabled', !(valid && notebookStatus.isOk()))
        }
        return {validate: makeRevalidate}
    }

    function handleProjectSelectBox(tokenStatus) {
        function makeRevalidate() {
            var valid = tokenStatus.isOk()
            var projectSelectBox = $('#neptune-project')
            projectSelectBox.prop('disabled', !valid)
        }
        return {validate: makeRevalidate}
    }

    function handleCodeRun(notebookStatus) {
        function makeRevalidate() {
            var valid = notebookStatus.isOk()
            var projectSelectBox = $('#neptune-integration-run')
            projectSelectBox.prop('disabled', !valid)
        }
        return {validate: makeRevalidate}
    }

    var globalApiAddress = null
    var globalAccessToken = null
    var globalUsername = null

    function getAccessToken(status, apiToken, continuation) {
        var decodedToken = {}
        try {
          decodedToken = JSON.parse(atob(apiToken))
        } catch(error) {
            status && status.clear()
            if (apiToken != '') {
                status && status.fail('Api token is not valid')
            } else {
                status && status.clear()
            }
            return false
        }

        status && status.spin()
        $.ajax({
            url: decodedToken.api_address + "/api/backend/v1/authorization/oauth-token",
            type: "GET",
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Neptune-Api-Token', apiToken);
            },
            success: function(data) {
                globalApiAddress = decodedToken.api_address
                globalAccessToken = data.accessToken
                globalUsername = data.username
                status && status.ok()
                continuation(decodedToken.api_address, data.accessToken, data.username)
            },
            error: function(data) {
                status && status.fail('Api token is not valid')
                return false
            }
        });
    }

    function getUserProjects(status, apiAddress, accessToken, continuation) {
        status.spin()
        $.ajax({
            url: apiAddress + "/api/backend/v1/projects2?userRelation=memberOrHigher",
            type: "GET",
            beforeSend: function(xhr){
                xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
            },
            success: function(projectData) {
                continuation(projectData)
            },
            error: function(projectData) {
              console.debug("Failed to exchange api token")
              console.debug(projectData)
              status.fail("Unable to download user projects")
            }
        })
    }

    function getNotebookData(status, apiAddress, accessToken, notebookId, username, continuation) {
            status && status.spin()
            $.ajax({
                url: apiAddress + "/api/leaderboard/v1/notebooks/" + notebookId,
                type: "GET",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                },
                success: function(nbData) {
                    var jupyterPath = IPython.notebook.notebook_path
                    if (nbData) {
                        if (nbData.projectId == $("#neptune-project").val() || !($("#neptune-project").val())) {
                          if (nbData.owner == username) {
                              if (nbData.path == jupyterPath) {
                                  status && status.ok()
                              } else {
                                  status && status.warn("Notebook was previously uploaded under different path")
                              }
                          } else {
                              status && status.fail("You are not the owner of this notebook. You need to create your own copy")
                          }
                        } else {
                          status && status.fail("You changed the project")
                        }
                        continuation(nbData)
                    }
                    return false
                },
                error: function(nbData) {
                    console.debug("get notebook error - assume we need to create new nb")
                    status && status.clear()
                    return false
                }
            })
    }

    function fillProjectSelectBox(status, selectedProjectId, projectData) {
        var currentProject = selectedProjectId
        var projectIdentifiers = projectData.entries.map(function(row) {
          return row.id
        })
        var projectIdsWithNames = projectData.entries.map(function(row) {
          return [row.id, row.organizationName + "/" + row.name]
        })
        $("#neptune-project option").remove()
        $.each(projectIdsWithNames, function (i, item) {
            $('#neptune-project').append($('<option>', {
                value: item[0],
                text : item[1]
            }));
        });
        if (projectIdentifiers.indexOf(currentProject) >= 0) {
          $('#neptune-project').val(currentProject)
          status.ok()
        } else {
            if (currentProject) {
                $('#neptune-project').append($('<option>', {
                    value: 'invalidProject',
                    text : "Undisclosed project"
                }));
                $('#neptune-project').val('invalidProject')
                status.fail("You don't have write access to this project")
            } else {
                status.ok()
            }
        }

    }

    function updateTextArea() {
        $("#neptune-integration-area").val("" +
                            "import os\n" +
                            "os.environ['NEPTUNE_API_TOKEN']='" + $("#neptune-api-token").val() + "'\n" +
                            "os.environ['NEPTUNE_PROJECT']='" + $("#neptune-project option:selected").text() + "'\n" +
                            "os.environ['NEPTUNE_NOTEBOOK_ID']='" + getNotebookId() + "'\n" +
                            "import neptune\n" +
                            "neptune.init()")
    }

    function build_upload_popup(apiAddress, accessToken, projectId, notebookId, modalProvider) {
        var neptune_popup = $('#neptune-upload-ext');
        if (neptune_popup.length > 0) return neptune_popup;
        neptune_popup = $('<div/>').attr('id', 'neptune-upload-ext');

        var controls = $('<form/>')
            .appendTo(neptune_popup)
            .addClass('form-horizontal');

        $('<div/>')
            .appendTo(controls)
            .append($('<div/>')
                .addClass('col-sm-12')
                .append($("<button />")
                    .text("Create new notebook in Neptune")
                    .addClass("btn")
                    .attr('id', 'neptune2-create-notebook')
                    .css("width", "50%")
                    .click(function(event) {
                        modalProvider().modal('hide')
                        createNotebook(null, apiAddress, accessToken, projectId)
                        return false;
                    })
                ).append($("<button />")
                    .text("Continue working with the same notebook")
                    .addClass("btn btn-primary")
                    .attr('id', 'neptune2-create-checkpoint')
                    .css("width", "50%")
                    .click(function(event) {
                        modalProvider().modal('hide')
                        createCheckpoint(null, apiAddress, accessToken)
                        return false;
                    })
                ));

        var form_groups = controls
            .children('div')
            .addClass('form-group');

        return neptune_popup;
    }

    function build_neptune_popup (apiTokenStatus, projectSelectStatus, notebookCreationStatus, initialApiToken, initialNotebookId) {
        var neptune_popup = $('#neptune-notebook-ext');

        var currentProjectId = null
        var currentApiToken = initialApiToken


        if (neptune_popup.length > 0) return neptune_popup;

        neptune_popup = $('<div/>').attr('id', 'neptune-notebook-ext');

        var controls = $('<form/>')
            .appendTo(neptune_popup)
            .addClass('form-horizontal');

        var projectSelectBox = handleProjectSelectBox(apiTokenStatus)
        var acceptButton = handleButton([apiTokenStatus, projectSelectStatus, notebookCreationStatus])
        var uploadButtons = handleUploadOptionsButtons(apiTokenStatus, projectSelectStatus, notebookCreationStatus)
        var runCodeButton = handleCodeRun(notebookCreationStatus)

        apiTokenStatus.add(acceptButton)
        apiTokenStatus.add(uploadButtons)
        apiTokenStatus.add(projectSelectBox)
        projectSelectStatus.add(acceptButton)
        projectSelectStatus.add(uploadButtons)
        notebookCreationStatus.add(acceptButton)
        notebookCreationStatus.add(uploadButtons)
        notebookCreationStatus.add(runCodeButton)
        apiTokenStatus.clear()
        projectSelectStatus.clear()
        notebookCreationStatus.clear()


        var initControls = function (tokenStatus, projectStatus, notebookStatus) {
            getAccessToken(tokenStatus, initialApiToken, function(apiAddress, accessToken, username) {
                getUserProjects(projectStatus, apiAddress, accessToken, function(projectData) {
                    if (getNotebookId()) {
                        getNotebookData(notebookStatus, apiAddress, accessToken, getNotebookId(), username, function(nbData) {
                            fillProjectSelectBox(projectStatus, nbData.projectId, projectData)
                            updateTextArea()
                        })
                    } else {
                        fillProjectSelectBox(projectStatus, null, projectData)
                        updateTextArea()
                    }
                })
            });
            return false;
        }

        $('<div/>')
            .appendTo(controls)
            .append(makeLabel('neptune-api-token', 'Api Token'))
            .append(
                $('<div/>')
                    .addClass('col-sm-9')
                    .append(
                        $('<input/>')
                            .addClass('form-control')
                            .attr('id', 'neptune-api-token')
                            .attr('type', 'text')
                            .val(initialApiToken)
                    ).append(apiTokenStatus.errorElem)
            )
            .append(apiTokenStatus.elem)
        $('<div/>')
            .appendTo(controls)
            .append(makeLabel('neptune-project', 'Select project'))
            .append(
                $('<div/>')
                .addClass('col-sm-9')
                .append(
                    $('<select/>')
                        .addClass('form-control')
                        .css("margin-left", "0px")
                        .attr('id', 'neptune-project')
                )
                .append(projectSelectStatus.errorElem)
            )
            .append(projectSelectStatus.elem);

        $('<div/>')
            .appendTo(controls)
            .append(makeLabel('neptune-notebook', 'Notebook'))
            .append($('<div/>')
                .addClass('col-sm-9')
                .append($("<button />")
                    .text("Create & upload notebook")
                    .addClass("btn")
                    .attr('id', 'neptune-create-notebook')
                    .css("width", "50%")
                    .click(function(event) {
                         save_notebook_in_neptune_with_tokens(notebookCreationStatus, globalApiAddress, globalAccessToken, globalUsername)
                         acceptButton.validate()
                         return false
                     })
                ).append($("<button />")
                    .text("Upload checkpoint")
                    .addClass("btn btn-primary")
                    .attr('id', 'neptune-create-checkpoint')
                    .css("width", "50%")
                    .click(function(event) {
                         save_checkpoint_in_neptune_with_tokens(notebookCreationStatus, globalApiAddress, globalAccessToken, globalUsername)
                         acceptButton.validate()
                         return false
                     })
                )

                .append(notebookCreationStatus.errorElem))
            .append(notebookCreationStatus.elem);

        $('<div/>')
            .appendTo(controls)
            .append(makeLabel('neptune-notebook', 'Integration'))
            .append($('<div/>')
                .addClass('col-sm-9')
                .append($("<textarea rows='7'/>")
                    .prop('disabled', true)
                    .addClass("form-control")
                    .css('resize', 'none')
                    .css('white-space', 'pre')
                    .css('overflow', 'auto')
                    .attr('id', 'neptune-integration-area')
                )
            )
            .append($("<button />")
                .text(" Run!")
                .addClass("btn btn-primary")
                .css("margin-left", "3px")
                .css("padding-left", "10px")
                .attr('id', 'neptune-integration-run')
                .click(function(event) {
                    IPython.notebook.kernel.execute($("#neptune-integration-area").val())
                     return false
                 })
            );

        initControls(apiTokenStatus, projectSelectStatus, notebookCreationStatus)

        var validate = function (tokenStatus, projectStatus, notebookStatus) {
            var apiToken = neptune_popup.find('#neptune-api-token').val()
            var decodedToken = {}
            try {
              decodedToken = JSON.parse(atob(apiToken))
            } catch(error) {
                tokenStatus.clear()
                if (apiToken != '') {
                    tokenStatus.fail('Api token is not valid')
                } else {
                    projectStatus.clear()
                }
                return false
            }
            getAccessToken(tokenStatus, apiToken, function(apiAddress, accessToken, username) {
                window.localStorage.setItem('neptune_api_token', apiToken)
                globalApiAddress = apiAddress
                globalAccessToken = accessToken
                globalUsername = username
                getUserProjects(projectStatus, apiAddress, accessToken, function(projectData) {
                    var currentProjectId = $("#neptune-project").val()
                    fillProjectSelectBox(projectStatus, currentProjectId, projectData)
                    getNotebookData(notebookStatus, apiAddress, accessToken, initialNotebookId, username, function(nbData) {})
                })
            })
            return false;
        }

        var input = controls.find("#neptune-api-token")
        input.data('oldVal', input.val());
        input.bind("change click keyup input paste", function(event) {
            // If value has changed...
            if (input.data('oldVal') !== input.val()) {
                // Updated stored value
                input.data('oldVal', input.val());
                // Do action
                validate(apiTokenStatus, projectSelectStatus, notebookCreationStatus)
            }
        });

        var input2 = controls.find("#neptune-project")
        input2.data('oldVal', input2.val());
        input2.bind("change click keyup input paste", function(event) {
            // If value has changed...
            if (input2.data('oldVal') !== input2.val()) {
                // Updated stored value
                input2.data('oldVal', input2.val());
                // Do action
                if (input2.val() == 'invalidProject') {
                    projectSelectStatus.fail("You don't have write access to this project")
                } else {
                    projectSelectStatus.ok()
                }
                validate(apiTokenStatus, projectSelectStatus, notebookCreationStatus)
            }
        });

        var form_groups = controls
            .children('div')
            .addClass('form-group');

        return neptune_popup;
    }

    function show_upload_popup(apiAddress, accessToken, projectId) {
        var modal;

        modal = dialog.modal({
            show: false,
            title: "Your notebook's path has changed, how would you like to continue?",
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,
            body: build_upload_popup(apiAddress, accessToken, projectId, getNotebookId(), function() {return modal;})
        }).attr('id', 'neptune_modal')
        modal.find('.neptune-popup-closer').prepend(
            $('<i/>')
                .addClass('fa fa-lg')
        );

        modal.modal('show');
    }

    function show_neptune_popup() {
        var modal;

        var apiTokenStatus = makeStatus();
        var projectSelectStatus = makeStatus();
        var notebookCreationStatus = makeStatus();

        var apiToken = window.localStorage.getItem('neptune_api_token') || ''
        var notebookId = getNotebookId()

        modal = dialog.modal({
            show: false,
            title: 'Configure connection to Neptune',
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,
            body: build_neptune_popup(apiTokenStatus, projectSelectStatus, notebookCreationStatus, apiToken, notebookId),
            buttons: {
                ' Close': {
                    class : 'btn-primary neptune-popup-closer',
                    click: function() {
                        var apiToken = modal.find('#neptune-api-token').val()
                        var project = modal.find('#neptune-project').val()
                        if (getNotebookId()) {
                          $("#neptune-upload-btn").show()
                          $("#neptune-authorize-btn").text("");
                          $("#neptune-authorize-btn").css("padding-left", "")
                          $("#neptune-authorize-btn").append("<i class='fa' />")
                        }
                    }
                }
            }
        }).attr('id', 'neptune_modal')
        modal.find('.neptune-popup-closer').prepend(
            $('<i/>')
                .addClass('fa fa-lg')
        ).prop('disabled', true);

        modal.modal('show');
    }

    function load_jupyter_extension () {
        return Jupyter.notebook.config.loaded.then(initialize);
    }

    return {
        load_jupyter_extension: load_jupyter_extension,
        load_ipython_extension: load_jupyter_extension
    };
});
