var Main = {};
var _ = {};

/// <summary>
/// When document is loaded, run all main
/// jQuery powered functionality.
/// </summary>
$(document).ready(function () {

    Main.CacheDocumentElements();

    // Window size tracking.
    Main.TrackWindowSize();

    // Window scroll tracking.
    Main.TrackScrolling();
});

Main.CacheDocumentElements = function() {

    _.header = $('#home');
    _.headerMenu = $('#header-menu');

    _.sections = $('section');
    _.sectionElements = getSectionElements(_.header, _.sections);
    _.sectionOffsets = new Array(_.sections.length + 1);

    _.menuLinks = $('.menu-link');
    _.menuLinkElements = getMenuLinkElements(_.menuLinks);

    /// <summary>
    /// Get reference object to each section.
    /// </summary>
    function getSectionElements(header, sections) {

        var sectionElements = new Array(sections.length);

        sectionElements[0] = header;

        $.each(sections, function(index) {

            sectionElements[index + 1] = $(this);
        });

        return sectionElements;
    }

    /// <summary>
    /// Get reference object to each menu link.
    /// </summary>
    function getMenuLinkElements(menuLinks) {

        var menuLinkElements = new Array(menuLinks.length);

        $.each(menuLinks, function(index) {

            menuLinkElements[index] = $(this);
        });

        return menuLinkElements;
    }
};

/// <summary>
/// De-bounced tracking of window resize events.  When
/// the size changes, update the UI accordingly.
/// </summary>
Main.TrackWindowSize = function () {

    // Cache the header menu height.
    var headerMenuHeight = _.headerMenu.height();

    // Any time the window is re-sized.
    $(window).resize($.debounce(250, function () {

        // Update and provide the already
        // looked-up window object.
        updateWindowSize();
    }));

    // Update once on load.
    updateWindowSize();

    // Update constants when window size changes.
    function updateWindowSize() {

        // Header height.
        updateHeaderHeight();

        // Section offsets.
        updateSectionOffset()
    }

    // Update header of the height.
    function updateHeaderHeight() {

        // Set the current header height (window height sans menu).
        _.headerHeight = _.header.height() - headerMenuHeight;
    }

    // Update section offsets from top of window.
    function updateSectionOffset() {

        $.each(_.sectionElements, function(index) {

            if (index == 0) {
                _.sectionOffsets[index] = 0;
            } else {

                var lastSectionOffset = _.sectionOffsets[index - 1];
                var nextSectionOffset = _.sectionElements[index - 1].height();

                _.sectionOffsets[index] = Math.floor(lastSectionOffset + nextSectionOffset);
            }
        });
    }
};

/// <summary>
/// Track window scroll events and use that information
/// to decide if header menu should stick to top.
/// </summary>
Main.TrackScrolling = function() {

    // Track scroll events.
    $(window).scroll(function () {

        // Update menu positioning.
        handleWindowScroll($(this));
    });

    // Run once on load.
    handleWindowScroll($(window));

    // Update header positioning based on
    // where the user is on the page.
    function handleWindowScroll (window) {

        var scrollTop = window.scrollTop();

        // Set menu position.
        updateHeaderMenuPosition(scrollTop);

        // Set active section.
        updateActiveSection(scrollTop);
    }

    function updateHeaderMenuPosition(scrollTop) {

        // If we have scroll passed the header.
        if (scrollTop > _.headerHeight) {

            // Set the menu to be fixed to top.
            if (_.headerMenu.hasClass('fixed') === false) {
                _.headerMenu.addClass('fixed');
            }

        } else {

            // Otherwise use default style.
            if (_.headerMenu.hasClass('fixed')) {
                _.headerMenu.removeClass('fixed');
            }
        }
    }

    function updateActiveSection(scrollTop) {
        for (var index = 0; index < _.sectionOffsets.length; index++) {

            if (isActiveSection(scrollTop, _.sectionOffsets)) {

                if (!_.menuLinkElements[index].hasClass('active')) {
                    _.menuLinkElements[index].addClass('active');

                    // Push new link state.
                    window.history.replaceState(null, document.title, _.menuLinkElements[index].attr('href'));
                }
            } else if (
                _.menuLinkElements[index].hasClass('active')) {
                _.menuLinkElements[index].removeClass('active');
            }
        }

        /// <summary>
        /// If scrolled between two sections or at the last section, it's active.
        /// </summary>
        function isActiveSection(scrollTop, sectionOffsets) {
            if (index + 1 < sectionOffsets.length) {
                return scrollTop >= sectionOffsets[index] && scrollTop < sectionOffsets[index + 1];
            } else {
                return scrollTop >= sectionOffsets[index];
            }
        }
    }
};
