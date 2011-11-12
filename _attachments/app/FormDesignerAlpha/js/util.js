/**
 * Just some useful JS tools and idioms
 */

if(typeof Object.create !== 'function') {
    Object.create = function(obj) {
        var Blank_Function = function(){};
        Blank_Function.prototype = obj;
        return new Blank_Function();
    };
}


//Trim dogpunch
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

if(typeof formdesigner === 'undefined'){
    var formdesigner = {};
}

formdesigner.util = (function(){
    var that = {};

    //VERIFY_RETURN_CODES:
    var VERIFY_CODES = {
            VERIFY_SUCCESS : 0,
            VERIFY_FAIL : 1,
            VERIFY_NO_DEFINITION : 2,
            VERIFY_ERROR : 3
    };
    that.VERIFY_CODES = VERIFY_CODES;

    var GROUP_OR_REPEAT_VALID_CHILDREN = that.GROUP_OR_REPEAT_VALID_CHILDREN = ["group","repeat","question","date","datetime","int","long","double","selectQuestion","trigger","secret","default"];

    /**
     * Grabs the value between the tags of the element passed in
     * and returns a string of everything inside.
     *
     * This method is kindy of hacky, so buyer beware.
     *
     * Motivation: Jquery's selector can't do this.  We need to be able to
     * grab the value of label tags, even if it includes <output> tags inside
     * of it (since the tag may need to be displayed to the user).
     * @param el - jquery selector or string used in the selector pointing to a DOM element.
     */
    var xmls = new XMLSerializer();
    function getXLabelValue (el){
        var resStr;
        function getEndTag (str) {
            var res, reo, last;
            reo = /<\/(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
            res = reo.exec(str);
            last = res;
            while(res !== null) {
                last = res;
                res = reo.exec(str);
            }
            if(last){
                return last[0];
            }else{
                return null;
            }
            
        }

        function getStartTag (str) {
            var re, res
            re = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/;
            res = re.exec(str);
            return res[0];
        }

        resStr = xmls.serializeToString($(el)[0]);
        resStr = resStr.replace(getStartTag(resStr),'').replace(getEndTag(resStr),'');
        return resStr;
    };
    that.getXLabelValue = getXLabelValue;

    var dumpFormTreesToConsole = function () {
        var vObj = [], vOut = [], i, invalidMT = [], mt;
                console.group("Tree Pretty Print");
                console.log("Control Tree:"+formdesigner.controller.form.controlTree.printTree())
                console.log("Data Tree:   "+formdesigner.controller.form.dataTree.printTree());
                console.log("TREE VALIDATION RESULT",formdesigner.controller.form.controlTree.isTreeValid());
                invalidMT = formdesigner.controller.form.getInvalidMugTypes();

                console.log("TREE MAP INVALID UFIDS", formdesigner.controller.form.getInvalidMugTypeUFIDs());
                for (i in invalidMT){
                    if(invalidMT.hasOwnProperty(i)){
                        mt = invalidMT[i];
                        vOut.push(mt);
                        vOut.push(mt.validateMug());
                    }
                }
                console.log("INVALID MTs,VALIDATION OBJ",vOut);
                console.groupEnd();
    };
    that.dumpFormTreesToConsole = dumpFormTreesToConsole;


    /**
     * From http://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
     * @param myString
     */
    function fromCamelToRegularCase(myString){
        var ret;
        // insert a space before all caps
        ret = myString.replace(/([A-Z])/g, ' $1')
        // uppercase the first character
                .replace(/^./, function(str){ return str.toUpperCase(); })

        return ret;
    }
    that.fromCamelToRegularCase = fromCamelToRegularCase;

    /**
     * Given two lists, creates a new array (and returns it)
     * that contains only unique values
     * based on comparing the two argument arrays.
     * @param arrA
     * @param arrB
     */
    var mergeArray = function (arrA, arrB) {
        var result = [], i;
        for(i in arrA){
            if(arrA.hasOwnProperty(i)){
                if(arrA.slice(0,arrA.indexOf(i)).indexOf(i) === -1){ //check to see if there aren't dupes in arrA
                    result.push(arrA[i]);
                }
            }
        }

        for(i in arrB){
            if(arrB.hasOwnProperty(i)){
                if(result.indexOf(arrB[i]) === -1){
                    result.push(arrB[i]); //grab only anything that hasn't shown up yet
                }
            }
        }

        return result;
    }
    that.mergeArray = mergeArray;

    /**
     * Given a (nodeset or ref) path, will figure out what the implied NodeID is.
     * @param path
     */
    function getNodeIDFromPath (path) {
        if (!path) {
            return null;
        }
        var arr = path.split('/');
        return arr[arr.length-1];
    }
    that.getNodeIDFromPath = getNodeIDFromPath;

    /**
     * Figures out what the xpath is of a controlElement
     * by looking at the ref or nodeset attributes.
     * @param el - a jquery selector or DOM node of an xforms controlElement.
     * @return - a string of the ref/nodeset value
     */
    function getPathFromControlElement (el) {
        if(!el){
            return null;
        }
        el = $(el); //make sure it's jquerified
        var path = el.attr('ref');
        if(!path){
            path = el.attr('nodeset');
        }
        if(!path) {
            return null;
        }

        return path;
    }
    that.getPathFromControlElement = getPathFromControlElement;


    //taken from http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
    //clones a 'simple' object (see link for full description)
    function clone(obj) {
        var copy, i;
        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" !== typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var len;
            copy = [];
            for (i = 0, len = obj.length; i < len; ++i) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
    that.clone = clone;

    that.question_counter = 1;
    /**
     * Private method for constructing unique questionIDs, labels for items, etc
     * @param prefixStr
     */
    var label_maker = function (prefixStr) {
        var ret = prefixStr + that.question_counter;
        that.question_counter += 1;
        return ret;
    }

    /**
     * Generates a unique question ID (unique in this form) and
     * returns it as a string.
     */
    that.generate_question_id = function () {
        return label_maker('question');
    };


    var generate_item_label = function () {
        return label_maker('item');
    };
    that.generate_item_label = generate_item_label;

    that.allowUnusedXMLAttributes = function(that){
        var unusedXMLattrs = {},
                unusedDOMNodes = [];


        /**
         * When parsing an XML form, store unused/unknown
         * xml data associated with a bind/data/control here.
         * If an attribute with this name already exists, it will
         * be overwritten with the new value.
         *
         * THESE ARE ATTRIBUTES FOR THE MAIN TAG (e.g. bind, data node, control Node)
         * USE addUnusedElement() to add entire unused/unrecognized nodes!
         * @param name - Attribute name
         * @param value - Attribute value
         */
        that.addUnusedAttr = function(name, value){
            unusedXMLattrs[name] = value;
        }

        /**
         * Gets all the unused/unknown XML node attributes
         * that were associated with this bind during parse time.
         *
         * Format is a dictionary of {attrName: attrValue} pairs.
         */
        that.getUnusedAttr = function(){
            return unusedXMLattrs;
        }

        /**
         * Used for storing unused/unrecognized DOM Nodes
         * at parse time.  When generating a new XML doc,
         * these nodes can be retrieved and inserted into the new doc.
         * @param DOMNode
         */
        that.addUnusedElement = function(DOMNode){
            unusedDOMNodes.push(DOMNode);
        }

        /**
         * Returns the unused DOM nodes as a list of DOM elements
         */
        that.getUnusedElements = function(){
            return unusedDOMNodes;
        }

        return that;
    }

    that.throwAndLogValidationError = function(vResult,mType,mug){
//            console.group("Failed Validation Objectss");
//            console.log("Validation Object:");
//            console.log(vResult);
//            console.log("MugType");
//            console.log(mType);
//            console.log("Mug");
//            console.log(mug);
//            console.groupEnd();
            throw 'Newly created mug did not validate! MugType and Mug logged to console...'
    }


    that.parseXml = function (xml) {
       var dom = null;
       if (window.DOMParser) {
          try {
             dom = (new DOMParser()).parseFromString(xml, "text/xml");
          }
          catch (e) { dom = null; }
       }
       else if (window.ActiveXObject) {
          try {
             dom = new ActiveXObject('Microsoft.XMLDOM');
             dom.async = false;
             if (!dom.loadXML(xml)) // parse error ..

                window.alert(dom.parseError.reason + dom.parseError.srcText);
          }
          catch (e) { dom = null; }
       }
       else
          alert("cannot parse xml string!");
       return dom;
    }
    /**
     * Takes in a reference mugType and makes a copy of
     * the object (the copy is returned).
     * @param refMug
     */
    var getNewMugType = function(refMugType){
        var newMugType = formdesigner.util.clone(refMugType);
        formdesigner.util.give_ufid(newMugType);
        return newMugType;
    };
    that.getNewMugType = getNewMugType;

    var DefinitionValidationException = function(message){
        this.message = message;
        this.name = "DefinitionValidationException";
    };
    that.DefinitionValidationException = DefinitionValidationException;

    var verify_mug = function(mug, definition){
        return VERIFY_CODES.VERIFY_ERROR; //not implemented yet!
    };
    that.verify_mug = verify_mug;

    //Simple Event Framework
    //Just run your object through this function to make it event aware
    //Taken from 'JavaScript: The Good Parts'
    var eventuality = function (that) {
        var registry = {};
        that.fire = function (event) {
    // Fire an event on an object. The event can be either
    // a string containing the name of the event or an
    // object containing a type property containing the
    // name of the event. Handlers registered by the 'on'
    // method that match the event name will be invoked.
            var array,
                func,
                handler,
                i,
                type = typeof event === 'string' ?
                        event : event.type;
    // If an array of handlers exist for this event, then
    // loop through it and execute the handlers in order.
            if (registry.hasOwnProperty(type)) {
                array = registry[type];
                for (i = 0; i < array.length; i += 1) {
                    handler = array[i];
    // A handler record contains a method and an optional
    // array of parameters. If the method is a name, look
    // up the function.
                    func = handler.method;
                    if (typeof func === 'string') {
                        func = this[func];
                    }
    // Invoke a handler. If the record contained
    // parameters, then pass them. Otherwise, pass the
    // event object.
                    func.apply(this,
                        handler.parameters || [event]);
                }
            }
            return this;
        };
        that.on = function (type, method, parameters) {
    // Register an event. Make a handler record. Put it
    // in a handler array, making one if it doesn't yet
    // exist for this type.
            var handler = {
                method: method,
                parameters: parameters
            };
            if (registry.hasOwnProperty(type)) {
                registry[type].push(handler);
            } else {
                registry[type] = [handler];
            }
            return this;
        };
        return that;
    };
    that.eventuality = eventuality;

    /**
     * Answers the question of whether
     * the refMugType can have children of type ofTypeMug.
     * @return list of strings indicating the allowed children types (if any).
     * can be any of 'group' 'repeat' 'select' 'item' 'question'
     */
    var canMugTypeHaveChildren = function(refMugType,ofTypeMug){
        var allowedChildren, n, targetMugTagName, refMugTagName,
                makeLower = function(s){
                    return s.toLowerCase();
                };

        if(!refMugType || !ofTypeMug || !ofTypeMug.properties.controlElement || !refMugType.properties.controlElement){ throw 'Cannot pass null argument or MugType without a controlElement!'; }
        if(!refMugType.controlNodeCanHaveChildren){ return false; }
        allowedChildren = refMugType.controlNodeAllowedChildren;
        allowedChildren = allowedChildren.map(makeLower);

        targetMugTagName = ofTypeMug.mug.properties.controlElement.properties.tagName.toLowerCase();
        refMugTagName = refMugType.mug.properties.controlElement.properties.tagName.toLowerCase();

        if(allowedChildren.indexOf(targetMugTagName) === -1){
            return false;
        }else{
            return true;
        }
    
    };
    that.canMugTypeHaveChildren = canMugTypeHaveChildren;

    /**
     * Determines where the newMugType should be inserted relative
     * to the refMugType.
     * @param refMugType - the reference MT already in the tree
     * @param newMugType - the new MT you want a relative position for
     * @return - String: 'first', 'inside' or 'after'
     */
    var getRelativeInsertPosition = function(refMugType, newMugType){
            var canHaveChildren;
            if(!refMugType){
                return "into";
            }

            canHaveChildren = formdesigner.util.canMugTypeHaveChildren(refMugType,newMugType);

            if(canHaveChildren){
                return "into";
            }else{
                return "after";
            }
    };
    that.getRelativeInsertPosition = getRelativeInsertPosition;

    /**
     * Looks at the mugType and attempts to retrieve an ItextID associated with the control element.
     * If none is found, generate one based on information in the mug.
     * @param mugType
     * @param isHint - do we want an itextID for a hint label?
     */
    var getNewItextID = function (mugType, isHint) {
        if(!mugType || !mugType.mug) {
            throw 'No mugType/mug specified for retreiving itextID!'
        }

        var mug, iID, cEl,bEl,dEl,MTProps, Itext, iidProp;
        mug = mugType.mug;
        MTProps = mugType.properties;
        Itext = formdesigner.model.Itext;
        if(MTProps.controlElement) {
            cEl = mug.properties.controlElement.properties;
        }
        if(MTProps.bindElement) {
            bEl = mug.properties.bindElement.properties;
        }
        if(MTProps.dataElement) {
            dEl = mug.properties.dataElement.properties;
        }
        if (isHint) {
            iidProp = 'hintItextID';
        } else {
            iidProp = 'labelItextID';
        }

        if(cEl) {
            iID = cEl[iidProp];
        }

        if(!iID) {
            if(dEl && dEl.nodeID) {
                iID = dEl.nodeID;
            }else if (bEl && bEl.nodeID){
                iID = bEl.nodeID;
            }

            if(iID && isHint) {
                iID += '_hint';
            }
        }

        if(!iID && (cEl && cEl.defaultValue)) {//implies this is a 'stdItem' mugType
            iID = cEl.defaultValue.replace(/ /g, ''); //strip whitespaces

            if(iID && isHint) {
                iID += '_hint';
            }
        }

        if(!iID) {
            throw 'Could not generate an Itext for given MugType:' + mugType + '.  Unknown MugType.';
        }

        return iID;
    };
    that.getNewItextID = getNewItextID;

    var generate_guid = function() {
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
    };

    var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var generate_xmlns_uuid = function () {
        var uuid = [], r, i;

		// rfc4122 requires these characters
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		// Fill in random data.  At i==19 set the high bits of clock sequence as
		// per rfc4122, sec. 4.1.5
		for (i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = Math.floor((Math.random()*16));
				uuid[i] = CHARS[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
			}
		}
		return uuid.toString().replace(/,/g,'');
    }
    that.generate_xmlns_uuid = generate_xmlns_uuid;

    /**
     * This method gives the passed object
     * a Unique Mug ID plus standardized method(s)
     * for accessing the ID.
     * @param that
     */
    var give_ufid = function(that){
        that.ufid = generate_guid();
    };
    that.give_ufid = give_ufid;

    that.XSD_DATA_TYPES = [
//            'xsd:anyURI',
            'xsd:base64Binary',
            'xsd:boolean',
            'xsd:byte',
            'xsd:date',
            'xsd:dateTime',
            'xsd:decimal',
            'xsd:double',
//            'xsd:duration',
            'xsd:float',
//            'xsd:gDay',
//            'xsd:gMonth',
//            'xsd:gMonthDay',
//            'xsd:gYear',
//            'xsd:gYearMonth',
//            'xsd:hexBinary',
            'xsd:int',
            'xsd:integer',
//            'xsd:language',
            'xsd:long',
            'xsd:short',
            'xsd:string',
            'xsd:time'
//            'xsd:unsignedByte',
//            'xsd:unsignedInt',
//            'xsd:unsignedLong',
//            'xsd:unsignedShort'
    ];

    that.VALID_CONTROL_TAG_NAMES = [
            'input',
            '1select',
            'select',
            'group',
            'repeat',
            'trigger',
            'item',
            'output',
            'secret'
    ]

    that.VALID_QUESTION_TYPE_NAMES = [
            'Text',
            'Group',
            'Repeat',
            'Trigger',
            'Single-Select',
            'Multi-Select',
            'Integer',
            'Double',
            'Long',
            'Float',
            'Date',
            'DateTime',
            'Time',
            'Picture',
            'Audio',
            'GPS',
            'Barcode',
            'Secret'
    ]

    /**
     * Shortcut func because I'm tired of typing this out all the time.
     * @param obj
     */
    var exists = function(obj){
        return typeof obj !== 'undefined';
    };
    that.exists = exists;

    var getLabelItextID = function (mug) {
        if(mug.properties.controlElement) {
            return mug.properties.controlElement.properties.labelItextID;
        }
    }
    that.getLabelItextID = getLabelItextID;

    var getDefaultDisplayItext = function (mug) {
        var iID, Itext;
        Itext = formdesigner.model.Itext;
        iID = that.getLabelItextID(mug);
        if(iID) {
            return Itext.getValue(iID,Itext.getDefaultLanguage(), 'default');
        }
        else {
            return null;
        }
    }
    that.getDefaultDisplayItext = getDefaultDisplayItext;


    (function($) {
              // duck-punching to make attr() return a map
              var _old = $.fn.attr;
              $.fn.attr = function() {
                  var a, aLength, attributes,	map;
                  if (this[0] && arguments.length === 0) {
                            map = {};
                            attributes = this[0].attributes;
                            aLength = attributes.length;
                            for (a = 0; a < aLength; a++) {
                                      map[attributes[a].name] = attributes[a].value;
                            }
                            return map;
                  } else {
                            return _old.apply(this, arguments);
                  }
        }
    }(jQuery));


    /**
     * Bind a number of standard event responses to a mug
     * so that it responds in a pre-determined fashion to default things
     *
     * Add stuff here when you want most/all mugs to behave in a certain
     * fashion on FD events.
     * @param mug
     */
    that.setStandardMugEventResponses = function (mug) {
        //NOTE: 'this' is the mug responding to the event.

        //bind dataElement.nodeID and bindElement.nodeID together
        mug.on('property-changed',function (e) {
            if(e.property === 'nodeID'){
                if(this.properties.dataElement){
                    this.properties.dataElement.properties.nodeID = e.val;
                }
                if(this.properties.bindElement){
                    this.properties.bindElement.properties.nodeID = e.val;
                }
            }
        });

        //Update the status of the indicator icons indicating where validation has failed
        mug.on('property-changed', function (e) {
            var MT = formdesigner.controller.form.controlTree.getMugTypeFromUFID(e.mugTypeUfid);
            formdesigner.ui.showVisualValidation(MT);
            formdesigner.ui.setTreeValidationIcons();
        });

        formdesigner.controller.form.on('form-property-changed', function (e) {
            var MT = formdesigner.controller.curSelMugType;
            formdesigner.ui.showVisualValidation(MT);
            formdesigner.ui.setTreeValidationIcons();
        })
    }

    /**
     * Renames a node in the JSTree display tree
     * @param ufid - MugType ufid
     * @param val - New value of the display label
     */
    that.changeUITreeNodeLabel = function (ufid, val) {
        var el = $('#' + ufid);
        $('#fd-question-tree').jstree('rename_node',el,val);
    }


    that.getMugDisplayName = function (mugType) {
        var iID, nodeID, cEl,dEl,bEl, mugProps, disp, lang, Itext;
        if(!mugType || !mugType.mug) {
            return 'No Name!'
        }
        mugProps = mugType.mug.properties;
        if (mugProps.controlElement) {
            cEl = mugProps.controlElement.properties;
        }
        if (mugProps.dataElement) {
            dEl = mugProps.dataElement.properties;
        }
        if (mugProps.bindElement) {
            bEl = mugProps.bindElement.properties;
        }
        Itext = formdesigner.model.Itext;

        if(cEl) {
            iID = cEl.labelItextID;
        }

        if(!iID) {
            if(bEl) {
                nodeID = bEl.nodeID;
            }
            if(!nodeID){
                if(dEl) {
                    nodeID = dEl.nodeID;
                }
            }

            if(nodeID) {
                disp = nodeID;
            } else {
                disp = 'No Display Name!';
            }
            return disp;
        }

        lang = formdesigner.currentItextDisplayLanguage;
        if(!lang) {
            lang = Itext.getDefaultLanguage();
        }

        if(!lang) {
            return 'No Translation Data';
        }

        disp = Itext.getValue(iID,lang,'default');
        if(!disp) {
            disp = Itext.getValue(iID, lang, 'long');
        }

        if (cEl.defaultValue && !disp) {
            disp = cEl.defaultValue;
        }

        return disp;
    }

    return that;

}());

// http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript/2480180#2480180

$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (!results)
    { 
        return 0; 
    }
    return results[1] || 0;
}