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
                IPython.notebook.kernel.execute("" +
                    "import os\n" +
                    "os.environ['NEPTUNE_API_TOKEN']='" + apiToken + "'\n" +
                    "os.environ['NEPTUNE_PROJECT']='" + project + "'\n" +
                    "import neptune\n" +
                    "neptune.init()\n")
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

        if (! (window.localStorage.getItem('neptune_api_token') || '')) {
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

    function injectNotebookId() {
        var neptuneMetadata = IPython.notebook.metadata.neptune
        if (neptuneMetadata && neptuneMetadata.notebookId) {
            IPython.notebook.kernel.execute("" +
                "import os\n" +
                "os.environ['NEPTUNE_NOTEBOOK_ID']='" + neptuneMetadata.notebookId + "'\n"
            )
        }

    }

    function createCheckpoint(api_address, accessToken) {
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
            },
            error: function(data) {
                console.error("Neptune failed to create new notebook checkpoint")
                errorNbSave(data)
            }
        });
    }

    function createNotebook(api_address, accessToken) {
        var jupyterPath = IPython.notebook.notebook_path
        var projectIdentifier = window.localStorage.getItem('neptune_project') || ''
        $.ajax({
            url: api_address + "/api/leaderboard/v1/notebooks?projectIdentifier=" + projectIdentifier + "&jupyterPath=" + jupyterPath,
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
                createCheckpoint(api_address, accessToken)
            },
            error: function(data) {
                console.error("Neptune failed to create new notebook")
                errorNbSave(data)
            }
        });
    }

    function askUserToUploadOrCreate(api_address, accessToken) {
        var modal;
        modal = dialog.modal({
            title: 'Upload notebook to Neptune',
            body: "The notebook you are working on was previously saved under xyx-path. By clicking Upload, you will continue working with this file.",
            buttons: {
                ' Upload': {
                    class : 'btn-primary',
                    click: function() {
                        createCheckpoint(api_address, accessToken)
                    }
                },
                ' Save as new notebok': {
                    class : '',
                    click: function() {
                        createNotebook(api_address, accessToken)
                    }
                }
            }
        })
    }

    var idleTimer = {
        handle: 0,
        start: function(fun) {
            this.stop();
            this.handle = setTimeout(fun, 2000);
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

    function errorNbSave(data) {
        nbSaveButtonReset()
        $("#neptune-upload-btn").prop("disabled", false)
        $("#neptune-upload-btn").find("i").addClass("fa-times-circle").css("color", "red")
        if (data && data.status == 403) {
            $("#neptune-upload-status")
                .text("Failed to upload notebook. You are not authorized to upload to project: "+window.localStorage.getItem('neptune_project'))
                .show()
        } else {
            $("#neptune-upload-status")
                .text("An error occurred while uploading, please try again.")
                .show()
        }
        idleTimer.start(idleNbSave)
    }


    function save_notebook_in_neptune() {
        duringNbSave()
        if (IPython.notebook.nbformat == 4) {
            var apiToken = window.localStorage.getItem('neptune_api_token') || ''
            var decodedToken = JSON.parse(atob(apiToken))
            $.ajax({
                url: decodedToken.api_address + "/api/backend/v1/authorization/oauth-token",
                type: "GET",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Neptune-Api-Token', apiToken);
                },
                success: function(data) {
                    var accessToken = data.accessToken
                    var username = data.username
                    if (metadata.neptune && metadata.neptune.notebookId) {
                        // get existing notebook
                        $.ajax({
                            url: decodedToken.api_address + "/api/leaderboard/v1/notebooks?id=" + metadata.neptune.notebookId,
                            type: "GET",
                            beforeSend: function(xhr){
                                xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                            },
                            success: function(nbData) {
                                console.debug(nbData)
                                var jupyterPath = IPython.notebook.notebook_path
                                if (nbData.owner == username) {
                                    // same owner, check path
                                    if (nbData.path == jupyterPath) {
                                        // same path - upload cp
                                        createCheckpoint(decodedToken.api_address, accessToken)
                                    } else {
                                        // path changed - ask user if create nb or add cp
                                        askUserToUploadOrCreate(decodedToken.api_address, accessToken)
                                    }
                                } else {
                                    // new owner - new notebook
                                    createNotebook(decodedToken.api_address, accessToken)
                                }
                            },
                            error: function(nbData) {
                                var accessToken = data.accessToken
                                console.debug("get notebook error - assume we need to create new nb")
                                createNotebook(decodedToken.api_address, accessToken)
                            }
                        })
                    } else {
                        createNotebook(decodedToken.api_address, accessToken)
                    }
                },
                error: function(data) {
                    console.debug("api token error")
                    console.debug(data)
                    errorNbSave(data)
                }
            });



            var metadata = IPython.notebook.metadata
        } else {
            console.error("Unsupported nbformat = " + IPython.notebook.metadata.nbformat)
            errorNbSave(null)
        }
    }

    function build_neptune_popup () {

        var neptune_popup = $('#neptune-notebook-ext');

        if (neptune_popup.length > 0) return neptune_popup;

        neptune_popup = $('<div/>').attr('id', 'neptune-notebook-ext');

        var validate = function () {
            var apiToken = neptune_popup.find('#neptune-api-token').val()
            var decodedToken = {}
            try {
              decodedToken = JSON.parse(atob(apiToken))
            } catch(error) {
                neptune_popup.find('#neptune-verify-btn i')
                    .removeClass()
                if (apiToken != '') {
                    neptune_popup.find('#neptune-verify-btn i')
                        .addClass('fa fa-2x fa-times-circle')
                        .css("color", "red")
                }
                $('#neptune_modal').find('.btn-primary')
                    .prop('disabled', true)
                return false
            }

            neptune_popup.find('#neptune-verify-btn i')
              .removeClass()
            neptune_popup.find('#neptune-verify-btn i')
                .addClass('fa fa-2x fa-spin fa-spinner')
                .css("color", "black")
            $.ajax({
                url: decodedToken.api_address + "/api/backend/v1/authorization/oauth-token",
                type: "GET",
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Neptune-Api-Token', apiToken);
                },
                success: function(data) {
                    var accessToken = data.accessToken
                    $.ajax({
                        url: decodedToken.api_address + "/api/backend/v1/projects2",
                        type: "GET",
                        beforeSend: function(xhr){
                            xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
                        },
                        success: function(projectData) {
                            var projectIdentifiers = projectData.entries.map(function(row) {
                              return row.organizationName + "/" + row.name
                            })
                            $("#neptune-project option").remove()
                               $.each(projectIdentifiers, function (i, item) {
                                $('#neptune-project').append($('<option>', {
                                    value: item,
                                    text : item
                                }));
                            });
                            var currentProject = window.localStorage.getItem('neptune_project') || ''
                            if (projectIdentifiers.indexOf(currentProject) >= 0) {
                              $('#neptune-project').val(currentProject)
                            } else {
                              $('#neptune-project').val(projectIdentifiers[0])
                            }
                            $('#neptune_modal').find('.btn-primary')
                                .prop('disabled', false)
                        },
                        error: function(projectData) {
                          console.debug("Failed to exchange api token")
                          console.debug(projectData)
                        }
                    })

                    neptune_popup.find('#neptune-verify-btn i')
                      .removeClass()
                      .addClass('fa fa-2x fa-check-circle')
                      .css("color", "green")
                },
                error: function(data) {
                    $('#neptune_modal').find('.btn-primary')
                        .prop('disabled', true)
                    neptune_popup.find('#neptune-verify-btn i')
                        .removeClass()
                        .addClass('fa fa-2x fa-times-circle')
                        .css("color", "red")
                    return false
                }
            });
            return false;
        }

        var controls = $('<form/>')
            .appendTo(neptune_popup)
            .addClass('form-horizontal');

        $('<div/>')
            .appendTo(controls)
            .append(
                $('<label/>')
                    .addClass('col-sm-2 control-label')
                    .css('padding-right', '1em')
                    .attr('for', 'neptune-api-token')
                    .text('Api Token')
            )
            .append(
                $('<div/>')
                  .addClass('col-sm-9')
                  .append(
                      $('<input/>')
                          .addClass('form-control')
                          .attr('id', 'neptune-api-token')
                          .attr('type', 'text')
                          .val(window.localStorage.getItem('neptune_api_token') || '')
                  )
            )
            .append(
                $('<div></div>')
                    .addClass('col-sm-1')
                    .attr("id", "neptune-verify-btn")
                    .click(validate)
                    .prepend($('<i/>')
                        .addClass('fa fa-2x fa-question-circle')
                        .css("margin-top", "2px")
                        .css("margin-left", "20px")
                        .css("color", "black")
                    )
            );
        $('<div/>')
            .appendTo(controls)
            .append(
                $('<label/>')
                    .addClass('col-sm-2 control-label')
                    .css('padding-right', '1em')
                    .attr('for', 'neptune-project')
                    .text('Select project')
            )
            .append(
                $('<div/>')
                .addClass('col-sm-10')
                .append(
                    $('<select/>')
                        .addClass('form-control')
                        .css("margin-left", "0px")
                        .attr('id', 'neptune-project')
                        .val(window.localStorage.getItem('neptune_project') || '')
            ));
        var input = controls.find("#neptune-api-token")
        input.data('oldVal', input.val());
        input.bind("change click keyup input paste", function(event) {
                    // If value has changed...
                    if (input.data('oldVal') !== input.val()) {
                        // Updated stored value
                        input.data('oldVal', input.val());
                        // Do action
                        validate()
                    }
                });


        var currentProject = window.localStorage.getItem('neptune_project') || ''
        if (currentProject) {
            controls.find('#neptune-project').append($('<option>', {
                value: currentProject,
                text : currentProject
            }));
            controls.find('#neptune-project').val(currentProject)
        }

        var form_groups = controls
            .children('div')
            .addClass('form-group');

        $('#neptune_modal').find('.btn-primary')
            .prepend($('<i/>').addClass('fa fa-lg'))
            .prop('disabled', true)
        validate()
        return neptune_popup;
    }

    function show_neptune_popup () {
        var modal;
        modal = dialog.modal({
            show: false,
            title: 'Configure connection to Neptune',
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.notebook.keyboard_manager,
            body: build_neptune_popup(),
            buttons: {
                ' Connect': {
                    class : 'btn-primary',
                    click: function() {
                        var apiToken = modal.find('#neptune-api-token').val()
                        var project = modal.find('#neptune-project').val()
                        window.localStorage.setItem('neptune_api_token', apiToken)
                        window.localStorage.setItem('neptune_project', project)
                        $("#neptune-upload-btn").show()
                        $("#neptune-authorize-btn").text("");
                        $("#neptune-authorize-btn").css("padding-left", "")
                        $("#neptune-authorize-btn").append("<i class='fa' />")
                        IPython.notebook.kernel.execute("" +
                            "import os\n" +
                            "os.environ['NEPTUNE_API_TOKEN']='" + apiToken + "'\n" +
                            "os.environ['NEPTUNE_PROJECT']='" + project + "'\n" +
                            "import neptune\n" +
                            "neptune.init()\n"
                        )
                    }
                }
            }
        })
        .attr('id', 'neptune_modal')
        modal.find('.btn-primary').prepend(
            $('<i/>')
                .addClass('fa fa-lg')
        ).prop('disabled', true)
        ;
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
