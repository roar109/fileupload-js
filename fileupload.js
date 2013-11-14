/**
 * Clase para hacer upload de archivos desde javascript dinamicamente
 * @author Martin Castellanos
 * @usuarioModificacion hector.mendoza
 * @fechaModificacion 25/03/2013
 * @param {String} formName Es el id y el name del formulario que se va a generar
 * @param {Function} callback Es el callback del upload, se llama al momento en que regresa del servidor
 * @param {Array<String>} tiposArchivo Las extensiones de los tipos de archivo que se van a validar (Por defecto son tipos de archivo permitidos)
 * @param {Boolean} excluirTiposArchivo Si es true los tiposArchivo van a ser los que no pueden ser agregados
 * de lo contrario los tipos de archivo, los tiposArchivo son los unicos que pueden ser agregados
 */
var FileUpload = Class.create({
    initialize: function(formName, callback, action, tiposArchivo, excluirTiposArchivo, parametrosAdicionales, idUploadButton) {
    	if(tiposArchivo){
    		this.tiposArchivo = tiposArchivo;
    		this.excluirTiposArchivo = excluirTiposArchivo;
    	}else{
    		this.tiposArchivo = ['.exe', '.bat', '.cmd', '.'];
    		this.excluirTiposArchivo = true;
    	}   	
    	this.isFinalized = false;
        this.name  = formName+'Object';
        this.callback = callback;
        var bodyElement = Element.extend(document.body);
        this.formElement = new Element('form', {
                                                id: formName,
                                                enctype: 'multipart/form-data',
                                                method: 'post',
                                                target: formName+'IFrame',
                                                action: action,
                                                style: 'display:none'
                              });
        bodyElement.insert(this.formElement);
        this.iframeElement = new Element('iframe', { 
            								name: formName+'IFrame',
            								style: 'display:none' 
         						});
        bodyElement.insert(this.iframeElement);
        if(this.callback){
            this.formElement.insert(new Element('input', {   
                                                            name: 'callback',
                                                            type: 'hidden',
                                                            value: this.callback
                                                         }));
        }
        /**Se manda parametros adicionales que se mandaran al CM.*/
        if(parametrosAdicionales){
        	for(var key in parametrosAdicionales){
                this.formElement.insert(new Element('input', {
                    name: key,
                    type: 'hidden',
                    value: parametrosAdicionales[key]
                 }));
        	}
        }
        this.idUploadButton = idUploadButton || null;
    },
    /**
     * Se agrega un listener para que cuando cambie el elemento pasado como parametro
     * se mueva a la forma oculta donde con upload() se le dara submit.
     * @param {Element} fileElement
     * */
    observeElement: function(fileElement){
        $(fileElement).observe('change', function(event){
                                            this.addFile($(Event.element(event)));
                                            if(this.idUploadButton){$(this.idUploadButton).enable();}
                                         }.bind(this));
    },
    /**
     * Se agrega un listener para que cuando cambie el elemento pasado como parametro
     * se mueva a la forma oculta donde con upload() se le dara submit.
     * @param {List<Element>} fileElement
     * */
    observeElements: function(fileElements){
        fileElements.each(this.observeElement.bindAsEventListener(this));
    },
    addFile: function(fileElement) {
        if(this.validateFileName(fileElement)){
            var divEstatus = new Element('div', {
                                                    id: fileElement.id+'Status',
                                                    className: 'fileUploadStatus'
                                                }).update(getFileName(fileElement.value));
            var editButton = new Element('input', { 
             										id: fileElement.id+'Edit',
                                                    type: 'button',
                                                    value: 'Seleccionar'
                                        });
            editButton.setAttribute('class', 'pure-button pure-button-xsmall');
            editButton.observe('click', this.editFile.bindAsEventListener(this, fileElement));
            divEstatus.insert(editButton);
            new Insertion.After(fileElement, divEstatus);
            this.formElement.insert(fileElement);
        }
    },
    validateFileName: function(fileElement){
    	var result = this.excluirTiposArchivo;
        var adviceId = 'advice-filetype-' + fileElement.id;
        var advice = $(adviceId);
        if(!advice){
            advice = new Element('div', {
                                            id: adviceId,
                                            style: 'display:none',
                                            className: 'rich-message-label'
                                        });
            advice.update('Tipo de archivo no permitido');
            new Insertion.After(fileElement, advice);
        }
        var v = fileElement.value;        
       	for(var j=0; j<this.tiposArchivo.length; j++){
       		if(v.endsWith(this.tiposArchivo[j])){
       			result = !this.excluirTiposArchivo;
       			break;
       		}
       	}
        if(result){
            advice.hide();
        }else{
            advice.show();
        }
        return result;
    },
    editFile : function(event, fileElement){
    	fileElement.clear();
        $(fileElement.id+'Status').replace(fileElement);
        if(this.idUploadButton){$(this.idUploadButton).disable();}
    },
    /**
     * Remueve un elemento de la forma creada dinamicamente.
     * @param {String} fileElementName
     * */
    stopObservingElement : function(fileElementName) {
    	this.formElement.removeChild($(fileElementName));
    },
    /**
     * Sube un documento al servlet/path dado.
     * */
    upload: function(){
    	if(this.isFinalized){alert('The main object has been finalized, you need to initialice again.');}
        this.formElement.encoding = 'multipart/form-data';
        this.formElement.submit();
    },
    /**
     * Destruye las formas y iframe que se hayan creado.
     * */
    finalize:function(){
    	/**Destroy available form, iframes*/
    	$(this.iframeElement).remove();
    	$(this.formElement).remove();
    	 if(this.idUploadButton){$(this.idUploadButton).disable();}
    	this.isFinalized = true;
    }
});

/**
 * 
 * */
function getFileName(fileName){
    lastSeparator = fileName.lastIndexOf('\\'); 
    return fileName.slice(lastSeparator != -1 ? lastSeparator+1 : 0);
}
