/*
 *
 * Copyright (c) 2015 ThinhTV, NTT Data
 *
 * Version 1.0
 *
 * $LastChangedDate: 2015-06-16 12:04:00 +0900 (Tue, 16 Jun 2015) $
 * $Rev: 1 $
 *
 */

;
(function($) {

  $.fn.copyable = function(opt, copyf) {
    /* input */
    var options = $.extend({
      addClasses: '',
      scope: '',
      //mode: 'textarea',
      //delay: 100
    }, opt);

    var _copiedf = null;
    this.copied = function(f) { _copiedf = f; return this; };

    return this.each(function() {
      var that = $(this);
      that.clipboard()
      //.beforecopy(function(e) {
      //  console.log('beforecopy.ntt handled');
      //})
      .copy(function(e) {
        copyf.call(that, e);
      });
    });
    /*
    var _keyCodes = {
      'C': 67,
      'V': 86
    };

    var _hackingElement = function(html, setf, selection) {
      // input
      // ninja element
      var $he = $(html);
      $he.css({
        'position': 'absolute',
        'left': '-1000px',
        'top': '-1000px'
      });
      $he.appendTo(document.body);
      if (setf != null) {
        setf.call($he);
      }
      document.designMode = 'off';
      // focus and select all
      $he.focus();
      if (selection) {
        $he.select();
      }
      // result
      return $he;
    };

    // looking for changes
    var _await = function(delay, a, bf, awaitCb, awaitErr) {
      var r = setInterval(function() {
        var b = bf.call(this);
        if (a == b) {
          clearInterval(r);
          awaitCb.call(this, b);
        } else {
          a = b;
        }
      }, delay);
    };

    var _plugins = {
      'textarea': function() {
        // return handler
        return {
          init: function(processf, opts) {
            $(document).keydown(function(e, args) {
              // CTRL + C
              if (e.ctrlKey && e.keyCode === _keyCodes.C) {
                return processf.call(this, opts);
              }
              return true;
            });
          },
          process: function(opts) {
            var thiz = $(this);
            var data = copyf.call(thiz); //TODO options?
            // hacking
            var $he = _hackingElement('<textarea></textarea>', function() {
              $(this).val(data);
            }, true);
            // waiting for changes
            _await(options.delay, '', function() {
              return $he.val();
            }, function(cbValue) {
              $he.remove();
              if (cb != null) {
                cb.call(thisValue);
              }
            });
            return true;
          },
          destroy: function(opts) {

          }
        };
      },
      'default': function() {
        // return handler
        return {
          init: function(cb, opts) {
          },
          copy: function(opts) {
            return true;
          },
          destroy: function(opts) {

          }
        }
      }
    };

    // valid pattern
    return this.each(function() {
      var thiz = $(this);
      var plugin = _plugins[options.mode].call(thiz);
      if (plugin.init.call(thiz, plugin.process, options)) {
        // initialized
      }
    });
    */
  };

})(jQuery);
