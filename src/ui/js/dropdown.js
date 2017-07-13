$(function () {

    function Dropdown(element, option) {
        this.element = element;
        this.target = this.element.find('.ycb-dropdown-target');
        this.content = this.element.find('.ycb-dropdown-content');
        this.trigger = option || 'click';
    }

    Dropdown.prototype.init = function () {
        var self = this;

        self.target.on(self.trigger + '.dropdown', function (e) {
            self.toggle();

            e.stopPropagation();
            if ($(this).attr('ycb-href') != 'true') {
                e.preventDefault();
            }
        });

        self.content.on(self.trigger + '.dropdown', function (e) {
            if ($(this).attr('ycb-noclick') == 'true') {
                e.stopPropagation();
            }
        });

        return this.element;

    }

    Dropdown.prototype.show = function () {
        hideAll();
        this.element.addClass('ycb-open');
    }

    Dropdown.prototype.hide = function () {
        this.element.removeClass('ycb-open');
    }

    Dropdown.prototype.toggle = function () {
        this[this.element.hasClass('ycb-open') ? 'hide' : 'show']();
    }

    function hideAll() {
        $('.ycb-dropdown').each(function () {
            var _this = $(this);
            if (_this.hasClass('ycb-open')) {
                _this.removeClass('ycb-open');
            }
        });
    }

    $.fn.ydropdown = function (option) {
        return this.each(function () {
            var self = $(this);
            return new Dropdown(self, option).init();
        });
    };

    $('.ycb-dropdown').ydropdown();

    $(document).on('click.dropdown', hideAll);

});