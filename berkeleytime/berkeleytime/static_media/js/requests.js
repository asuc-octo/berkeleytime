var requests = new (function ($) {
    /**
    * Add a jquery method to serialize form data into a key-value dictionary.
    * @return {object} the fields of the form in dictionary form
    */
    $.fn.serializeObject = function () {
        //http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
        var o = {};
        var a = this.serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
        return o;
    };

    /**
    * Given a form and parameters, submit the form asynchronously via ajax.
    * @param form {jQuery} the form to be submitted
    * @param params {object} extra params to pass to the request
    * @param method {string} 'get' or 'post', the method to submit the form in
    * @param callback {function(data)} callback to perform on the returned data
    * @param datatype {string | undefined} the data type to interpret the response as. defaults to json.
    * @return undefined
    */
    this.submitViaAjax = function (form, params, method, callback, datatype) {
        datatype = datatype || 'json'; // try to get the data as json by default
        url = form.prop("action").replace(/^http\:\/\/[A-Za-z0-9\:]*\//, '/');
        obj = form.serializeObject();
        $.extend(obj, params);
        var fn;
        if (method === 'post') {
            fn = $.post;
        } else {
            fn = $.get;
        }

        fn(url, obj, callback, datatype);
    };
})(window.jQuery);