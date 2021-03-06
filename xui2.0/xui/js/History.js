xui.Class("xui.History",null,{
    Static:{
        activate:function(){
            var self=this;
            if(self._activited)return;
            self._activited=1;
            switch(self._type){
                case 'event':
                    window.onhashchange=self._checker;
                break;
                case "iframe":
                    document.body.appendChild(document.createElement('<iframe id="'+self._fid+'" src="about:blank" style="display: none;"></iframe>'));
                    var doc=document.getElementById(self._fid).contentWindow.document;
                    doc.open("javascript:'<html></html>'");
                    doc.write("<html><head><scri" + "pt type=\"text/javascript\">parent.xui.History._checker('"+hash+"');</scri" + "pt></head><body></body></html>");
                    doc.close();
                case 'timer':
                    if(self._itimer)
                        clearInterval(self._itimer);
                    self._itimer = setInterval(self._checker, 200);
                break;
            }
        },
        _fid:'xui:history',
        _type:(xui.browser.ie && (xui.browser.ver<8))?'iframe':("onhashchange" in window)?'event':'timer',
        _callbackTag:null,
        _callbackArr:null,
        _inner_callback:null,
        _callback:function(fragment, init, newAdd){
            var ns=this, arr, f;
            xui.arr.each(xui.Module._cache,function(m){
              // by created order    
               if(m._evsClsBuildIn && ('onFragmentChanged' in m._evsClsBuildIn)){
                   // function or pseudocode
                   if(xui.isFun(f = m._evsClsBuildIn.onFragmentChanged) || (xui.isArr(f) && f[0].type)){
                       m.fireEvent('onFragmentChanged', [m,fragment, init, newAdd]);
                   }
               }
               else if(m._evsPClsBuildIn && ('onFragmentChanged' in m._evsPClsBuildIn)){
                   // function or pseudocode
                   if(xui.isFun(f = m._evsPClsBuildIn.onFragmentChanged) || (xui.isArr(f) && f[0].type)){
                       m.fireEvent('onFragmentChanged', [m,fragment, init, newAdd]);
                   }
               }
            });
            // tag
            if(xui.isFun(ns._callbackTag) && false===ns._callbackTag(fragment, init, newAdd))return;
            // tagVar
            arr = ns._callbackArr;
            if(arr&&xui.isArr(arr)){
                for(var i=0,l=arr.length;i<l;i++){
                    if(xui.isFun(arr[i]) && false===arr[i](fragment, init, newAdd))
                        return;
                }
            }
            // the last one
            if(xui.isFun(ns._inner_callback))ns._inner_callback(fragment, init, newAdd);
        },
        /* set callback function
        callback: function(hashStr<"string after #!">)
        */
        setCallback: function(callback){
            var self=this,
                hash = location.hash;
            if(hash)hash='#!' + encodeURIComponent((''+decodeURIComponent(hash)).replace(/^#!/,''));
            else hash="#!";
            self._inner_callback = callback;

            self._lastFI = decodeURIComponent(hash);

            self._callback(decodeURIComponent(self._lastFI.replace(/^#!/, '')), true, callback);

            return self;
        },
        _checker: function(hash){
            var self=xui.History;
            switch(self._type){
                case "iframe":
                    if(xui.isSet(hash))
                        location.hash=hash;
                case 'event':
                case 'timer':
                    if(decodeURIComponent(location.hash) != decodeURIComponent(self._lastFI)) {
                        self._lastFI = decodeURIComponent(location.hash);
                        self._callback(decodeURIComponent(location.hash.replace(/^#(!)?/, '')));
                    }
                break;
            }
        },
        getFI:function(){
            return this._lastFI;
        },
        /*change Fragement Identifier(string after '#!')
        */
        setFI:function(fi,triggerCallback,merge){
            var self=this;
            
            self.activate();

            // ensure encode once
            if(fi){
                if(!xui.isHash(fi))fi=xui.urlDecode((fi+'').replace(/^#!/,'')); //encodeURIComponent((''+decodeURIComponent(fi)).replace(/^#!/,''));
                if(merge)fi = xui.merge(fi, xui.getUrlParams(), 'without');
                fi='#!' + xui.urlEncode(fi);
            }else{
                fi="#!";
            }
            if(self._lastFI == decodeURIComponent(fi))return false;

            switch(self._type){
                case "iframe":
                    var doc=document.getElementById(self._fid).contentWindow.document;
                    doc.open("javascript:'<html></html>'");
                    doc.write("<html><head><scri" + "pt type=\"text/javascript\">parent.xui.History._checker('"+fi+"');</scri" + "pt></head><body></body></html>");
                    doc.close();
                break;
                case 'event':
                case 'timer':
                    location.hash = self._lastFI = decodeURIComponent(fi);
                if(triggerCallback!==false)
                    self._callback(decodeURIComponent(fi.replace(/^#!/,'')));
                break;
            }
        }
    }
});