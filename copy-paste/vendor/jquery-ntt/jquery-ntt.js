;
(function($) {

  $.ntt = $.ntt || {};

  $.extend($.ntt, {
    version: '0.0.1'
  });

  $.extend($.ntt, {
    call: function(f, ctx) {
      if (typeof f == 'function') {
        return f.apply(ctx, _.rest(arguments, 2));
      }
    },
    apply: function(f, ctx) {
      if (typeof f == 'function') {
        return f.apply(ctx, arguments != null && arguments.length > 2 ? arguments[2] : []);
      }
    }
  })
})(jQuery);
