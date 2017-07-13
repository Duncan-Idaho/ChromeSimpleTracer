$(function () {

    var defaults = {};

    function Check(element, option) {
        this.element = element;
        this.option = $.extend({}, defaults, typeof option == 'object' && option);
    }

    Check.prototype.init = function () {
        var self = this;
        self.wrapped = self[self.element.attr('type')]();

        self.element.on('click', function () {
            self.toggle();
        });

        return self.element;
    };

    Check.prototype.radio = function () {
        var self = this;
        var wrapped = $('<div class="ycb-check ycb-radio"></div>');
        var checked = self.element.prop('checked');
        wrapped.addClass(checked ? 'ycb-checked' : 'ycb-default');

        var check = $('<span class="icon-radio-default"></span>');
        var defaut = $('<span class="icon-radio-checked"></span>');

        self.element.wrap(wrapped)
            .before(defaut)
            .before(check);

        return self.element.parent();
    };

    Check.prototype.checkbox = function () {
        var self = this;
        var wrapped = $('<div class="ycb-check ycb-checkbox"></div>');
        var checked = self.element.prop('checked');
        wrapped.addClass(checked ? 'ycb-checked' : 'ycb-default');

        var check = $('<span class="icon-checkbox-default"></span>');
        var defaut = $('<span class="icon-checkbox-checked"></span>');

        self.element.wrap(wrapped)
            .before(defaut)
            .before(check);

        return self.element.parent();
    };

    Check.prototype.toggle = function () {
        setTimeout(function () {
            $('input[ycb-check]').each(function () {
                var _this = $(this);
                if (_this.prop('checked')) {
                    _this.parent().removeClass('ycb-default').addClass('ycb-checked');
                } else {
                    _this.parent().removeClass('ycb-checked').addClass('ycb-default');
                }
            });
        }, 0);
    };

    $.fn.ycheck = function (option) {
        return this.each(function () {
            var self = $(this);
            return new Check(self, option).init();
        });
    };

    $('[ycb-check]').ycheck();

});