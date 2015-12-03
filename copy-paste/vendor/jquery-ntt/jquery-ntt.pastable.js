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

  $.fn.pastable = function(opt, pastef, cb) {
    /* input */
    var options = $.extend({
      accept: '',
      activeClass: '',
      addClasses: '',
      scope: '',
      //mode: 'textarea',
      //delay: 100
    }, opt);

    return this.each(function() {
      var that = $(this);
      that.clipboard()
      /*
      .beforepaste(function(e) {
          console.log('beforepaste.ntt handled');
      })
      */
      .paste(function(e) {
          console.log('paste.ntt handled');
          pastef.call(that, e);
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
              // CTRL + V
              if (e.ctrlKey && e.keyCode === _keyCodes.V) {
                return processf.call(this, opts);
              }
              return true;
            });
          },
          process: function(opts) {
            var thiz = $(this);
            // hacking
            var $he = _hackingElement('<textarea></textarea>', null, true);
            // waiting for changes
            _await(options.delay, '', function() {
              return $he.val();
            }, function(cbValue) {
              $he.remove();
              pastef.call(this, cbValue);
              if (cb != null) {
                cb.call(this, cbValue);
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
          process: function(opts) {
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
