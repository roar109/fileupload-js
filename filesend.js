var FileSend = function(config){
  var $that = this;
  this.isFinalized = false;
  this.utils = {};
  this.config = {
    formName : config.formName,
    action : config.action,
    callback : config.callback,
    fileTypes : config.fileTypes,
    excludeFileTypes : config.excludeFileTypes || false,
    additionalParameters : config.additionalParameters,
    idUploadButton : config.idUploadButton || null
  };

  this.name  = this.config.formName + 'Object';
  this.callback = this.config.callback;

  //initialize all the main stuff
  if(!this.config.fileTypes){
    this.config.fileTypes = ['.exe', '.bat', '.cmd', '.'];
    this.config.excludeFileTypes= true;
  }

  var bodyElement = $(document.body)[0];
  bodyElement = $(bodyElement);
  this.formElement = $('<form>',{
                                    id: this.config.formName,
                                    enctype: 'multipart/form-data',
                                    method: 'post',
                                    target: this.config.formName+'IFrame',
                                    action: this.config.action,
                                    style: 'display:none'
                          });
  bodyElement.append(this.formElement);
  this.iframeElement = $('<iframe>', {
                          name: this.config.formName+'IFrame',
                          style: 'display:none'
                        });

  bodyElement.append(this.iframeElement);

  if(this.config.callback){
        this.formElement.append($('<input>', {
                                              name: 'callback',
                                              type: 'hidden',
                                              value: $that.config.callback
                                }));
  }

  if(this.config.additionalParameters){
      for(var key in this.config.additionalParameters){
            this.formElement.append($('<input>', {
                name: key,
                type: 'hidden',
                value: $that.config.additionalParameters[key]
             }));
      }
  }
  //end initial stuff

  this.observeElement = function(fileElement){
    $(fileElement).on('change', function(event){
      $that.addFile(event.target);
    });
  };

  this.observeElements = function(fileElements){
    fileElements.each(function(fileElmnt){
      $that.observeElement(fileElmnt);
    });
  };

  this.addFile = function(fileElement){
    if($that.utils.validateFileName(fileElement)){
        var divEstatus = new $('<div>', {
                                          id: fileElement.id + 'Status',
                                          className: 'fileUploadStatus'//TODO
                                      }).html($that.utils.getFileName(fileElement.value));
        var editButton = new $('<input>', {
                            id: fileElement.id+'Edit',
                                                type: 'button',
                                                value: 'Edit'
                                    });
        editButton.attr('class', 'pure-button pure-button-xsmall');//TODO
        editButton.on('click', function(event){
          $that.editFile(fileElement);
        });
        divEstatus.append(editButton);
        $(fileElement).after(divEstatus);
        $that.formElement.append(fileElement);

        $that.utils.enableDisableElement($that.config.idUploadButton, false);
    }else{
      $that.utils.enableDisableElement($that.config.idUploadButton, 'disabled');
    }
  };

  this.editFile = function(fileElement){
    $(fileElement).val('');
    $('#'+fileElement.id + 'Status').after($(fileElement));
    $('#'+fileElement.id + 'Status').remove();
    $that.utils.enableDisableElement($that.config.idUploadButton, 'disabled');
  };

  this.stopObservingElement = function(fileElement){
    $that.formElement.remove(fileElement);
  };

  this.upload = function(){
    if($that.isFinalized){alert('The main object has been finalized, you need to initialize again.');}
    $that.formElement.encoding = 'multipart/form-data';
    $that.formElement.submit();
  };

  this.finalize = function(){
    $that.isFinalized = true;
    $($that.iframeElement).remove();
    $($that.formElement).remove();
    $that.utils.enableDisableElement($that.config.idUploadButton, 'disabled');
  };

  this.reset = function(fileElement){
	  $that.editFile(fileElement);
  };

  this.utils.validateFileName = function(fileElement){
    var result = $that.config.excludeFileTypes;
    var adviceId = 'advice-filetype-' + fileElement.id;
    var advice = $('#'+adviceId);
    if(advice.length == 0){
          advice = $('<div>', {
                                  id: adviceId,
                                  style: 'display:none',
                                  class: 'danger'//TODO
                              });
          advice.html('File type not allowed');
          $(fileElement).after(advice);
    }
    var v = fileElement.value;
    for(var j=0; j < $that.config.fileTypes.length; j++){
        if(v.endsWith($that.config.fileTypes[j])){
          result = !$that.config.excludeFileTypes;
          break;
        }
    }

    if(result){
          advice.hide();
    }else{
          advice.show();
    }
    return result;
  };

  this.utils.getFileName = function(fileName){
    lastSeparator = fileName.lastIndexOf('\\');
    return fileName.slice(lastSeparator != -1 ? lastSeparator + 1 : 0);
  };

  this.utils.enableDisableElement = function(elementId, disable){
    $('#'+elementId).attr('disabled', disable);
  };

  return {
    observeElement  : $that.observeElement,
    observeElements : $that.observeElements,
    addFile         : $that.addFile,
    editFile        : $that.editFile,
    stopObservingElement : $that.stopObservingElement,
    upload          : $that.upload,
    finalize        : $that.finalize,
    reset			: $that.reset
  };
};
