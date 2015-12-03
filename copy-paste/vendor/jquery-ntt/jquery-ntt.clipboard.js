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

  $.fn.clipboard = function(o) {

    // events & actions
    var _beforecopyf = null;
    var _beforecutf = null;
    var _beforepastef = null;
    var _copyf = null;
    var _cutf = null;
    var _pastef = null;

    this.beforecopy = function(f) { _beforecopyf = f; return this; }
    this.copy = function(f) { _copyf = f; return this; }
    this.beforecut = function(f) { _beforecutf = f; return this; }
    this.cut = function(f) { _cutf = f; return this; }
    this.beforepaste = function(f) { _beforepastef = f; return this; }
    this.paste = function(f) { _pastef = f; return this; }

    // clipboard adapters
    var _clipboardAdapters = {
      'native': function() {
        var _clb = window.clipboardData;
        // check support
        if (!window.clipboardData) {
          return false;
        }
        // initialization (if any)
        // return clipboard bridge
        return {
          getData: function(fmt, cbf) {
            var data = _clb.getData(fmt);
            $.ntt.call(null, cbf, data);
            return data;
          },
          setData: function(fmt, data) {
            return _clb.setData(fmt, data);
          },
          clearData: function() {
            return true;
          }
        };
      },
      'deprecatedMozilla': function() {
        // UniversalXPConnect privilege is required for clipboard access in Firefox
        try {
          if (window.netscape
            && window.netscape.security
            && window.netscape.security.PrivilegeManager
            && window.netscape.security.PrivilegeManager.enablePrivilege) {
            window.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
          } else {
            return false;
          }
        } catch (ex) {
          return false;
        }
        // initialization (if any)
        // return clipboard bridge
        return {
          getData: function(fmt, cbf) {
            // input
            fmt = (fmt != null ? 'text/unicode' : fmt);
            // business
            var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
            if (!clip) {
              return null;
            }

            var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
            if (!trans) {
              return null;
            }
            trans.addDataFlavor(fmt);

            clip.getData(trans, clip.kGlobalClipboard);

            // buffer objects
            var res  = new Object();
            var strLength = new Object();
            var data = '';

            trans.getTransferData(fmt, res, strLength);
            if (res) {
              res = res.value.QueryInterface(Components.interfaces.nsISupportsString);
            }
            if (res) {
              data = res.data.substring(0, strLength.value / 2);
            }
            // data retrieved callback
            $.ntt.call(cbf, null, data);
            // return retrieved data
            return data;
          },
          setData: function(fmt, data) {
            // input
            fmt = (fmt != null ? 'text/unicode' : fmt);
            // business

            // copy the selected content to the clipboard
            // works in Firefox and in Safari before version 5
            //success = document.execCommand("copy", false, null);

            // for later versions
            var res = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
            res.data = data;

            var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
            if (!trans) {
              return false;
            }

            trans.addDataFlavor(fmt);
            trans.setTransferData(fmt, res, data.length * 2);

            var clipboardId = Components.interfaces.nsIClipboard;
            var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipboardId);
            if (!clip) {
              return false;
            }

            return clip.setData(trans, null, clipid.kGlobalClipboard);

            /*
            // Flash doesn't work anymore :(
            if (inElement.createTextRange) {
                var range = inElement.createTextRange();
                if (range && BodyLoaded==1)
                    range.execCommand('Copy');
            } else {
                var flashcopier = 'flashcopier';
                if(!document.getElementById(flashcopier)) {
                    var divholder = document.createElement('div');
                    divholder.id = flashcopier;
                    document.body.appendChild(divholder);
                }
                document.getElementById(flashcopier).innerHTML = '';

                var divinfo = '<embed src="_clipboard.swf" FlashVars="clipboard='+escape(inElement.value)+'" width="0" height="0" type="application/x-shockwave-flash"></embed>';
                document.getElementById(flashcopier).innerHTML = divinfo;
            }
            */
          },
          clearData: function() {
            return true;
          }
        };
      },
      'zeroclipboard': function() {
        // check if flash is supported
        try
        {
          new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        } catch(e) {
          if (navigator.mimeTypes
              && typeof navigator.mimeTypes["application/x-shockwave-flash"] == 'undefined'
              && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
            // enabled already
          } else {
            return false;
          }
        }
        // initialization (if any)
        // return clipboard bridge
        return {
          getData: function(fmt) {
            // TODO implement this
            // data retrieved callback
            $.ntt.call(cbf, null, null);
            // return retrieved data
          },
          setData: function(fmt, data) {

          },
          clearData: function() {
            return true;
          }
        };
      },
      'ninja': function() {
        // input
        //mode = (mode == null ? '' : mode);
        // utils
        var _ninjaElement = function(html, setf, selectf) {
          // input
          // ninja element
          var $elem = $(html).css({
            'position': 'absolute',
            'left': '-1000px',
            'top': '-1000px'
          });
          $elem.appendTo(document.body);
          // additional set callback
          if (setf != null) {
            setf.call($elem.get(0));
          }
          // additional select callback
          if (selectf != null) {
            selectf.call($elem.get(0));
          }
          return $elem;
        };

        var _await = function(delay, a, bf, cb) {
          var r = setInterval(function() {
            var b = bf.call(this);
            if (a == b) {
              clearInterval(r);
              cb.call(this, b);
            } else {
              a = b;
            }
          }, delay);
        };

        var _selectContentOf = function(element) {
          var $e = $(element),
              element = $e.get(0);

          if ($e.is('input[type=text], textarea')) {
            // select all input contents
            element.focus();
            element.select();
          } else {
            // select all DOM elements
            if (document.body.createTextRange) {
              var range = document.body.createTextRange();
              range.moveToElementText(element);
              range.select();
            } else if (window.getSelection) {
              var selection = window.getSelection();
              var range = document.createRange();
              range.selectNodeContents(element);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        };
        // initialization (if any)
        // return clipboard bridge
        return {
          getData: function(fmt, cbf) {
            // let browser paste themself
            var ninjaElem = _ninjaElement('<textarea>', null, function() {
              // select pasted text
              _selectContentOf(this);
            });
            // wait and let user paste
            _await(100, '', function() {
              // after millisecs, check any changes of this ninja value
              return ninjaElem.val();
            }, function(data) {
              // data retrieved callback
              $.ntt.call(cbf, null, data);
              // remove ninja element
              ninjaElem.remove();
            });
          },
          setData: function(fmt, data) {
            var ninjaElem = _ninjaElement('<textarea>', function() {
              // put text to ninja element
              $(this).val(data);
              // make entire document uneditable
              document.designMode = 'off';
            }, function() {
              // selection range to be copied
              _selectContentOf(this);
            });
            // wait and let user copy
            _await(100, '', function() {
              // after millisecs, check any changes of this ninja value
              return ninjaElem.val();
            }, function(data) {
              // remove ninja element
              ninjaElem.remove();
            });
          },
          clearData: function() {
            return true;
          }
        };
      }
    };

    // automatically look-up for compatible clipboard adapter
    var _foundClipboardAdapter = (_.find(_clipboardAdapters, function(v, k, l) {
      return v.call() !== false;
    })).call();

    // clipboard factory
    var _clipboardSupporterFactory = function(eventType) {
      var that = $(this);
      var _wrapEvent = function(e) {
        return {
          clipboardData: _foundClipboardAdapter,
          preventDefault: function() {
            return e.preventDefault();
          }
        };
      };

      // DOM events (IE, WebKit)
      var domEventClipboardSupporter = function() {
        return {
          init: function() {
            that.on('beforecopy', function(e) {
              $.ntt.call(_beforecopyf, that, _wrapEvent(e));
            })
            .on('copy', function(e) {
              $.ntt.call(_copyf, that, _wrapEvent(e));
            })
            .on('beforecut', function(e) {
              $.ntt.call(_beforecutf, that, _wrapEvent(e));
            })
            .on('cut', function(e) {
              $.ntt.call(_cutf, that, _wrapEvent(e));
            })
            .on('beforepaste', function(e) {
              $.ntt.call(_beforepastef, that, _wrapEvent(e));
            })
            .on('paste', function(e) {
              $.ntt.call(_pastef, that, _wrapEvent(e));
            });
            return true;
          },
          destroy: function() {
            that.off('beforecopy');
            that.off('copy');
            that.off('beforecut');
            that.off('cut');
            that.off('beforepaste');
            that.off('paste');
          }
        };
      };

      // Keyboard events
      var keydownClipboardSupporter = function() {
        var _keyCodes = {
          'C': 67,
          'V': 86,
          'X': 88
        };
        var _keydownHanlder = null;

        return {
          init: function() {
            _keydownHanlder = function(e, args) {
              if (e.ctrlKey && e.keyCode === _keyCodes.C) {
                // CTRL + C
                $.ntt.call(_beforecopyf, that, _wrapEvent(e));
                $.ntt.call(_copyf, that, _wrapEvent(e));
              } else if (e.ctrlKey && e.keyCode === _keyCodes.X) {
                // CTRL + X
                $.ntt.call(_beforecutf, that, _wrapEvent(e));
                $.ntt.call(_cutf, that, _wrapEvent(e));
              } else if (e.ctrlKey && e.keyCode === _keyCodes.V) {
                // CTRL + V
                $.ntt.call(_beforepastef, that, _wrapEvent(e));
                $.ntt.call(_pastef, that, _wrapEvent(e));
              }
            };

            that.keydown(_keydownHanlder);
            return true;
          },
          destroy: function() {
            that.off(_keydownHanlder);
          }
        };
      };

      return keydownClipboardSupporter.call();
    };

    return this.each(function() {
      var that = $(this);
      var sup = _clipboardSupporterFactory.call(that);
      sup.init();
    });
  };

})(jQuery);
