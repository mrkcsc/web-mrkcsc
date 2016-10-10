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

    // Handle navigation.
    //Main.HandleMenuNavigation();
});

Main.CacheDocumentElements = function() {

    _.header = $('#header');
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

            if (isActiveSection(scrollTop)) {

                if (!_.menuLinkElements[index].hasClass('active')) {
                    _.menuLinkElements[index].addClass('active');
                }
            } else if (
                _.menuLinkElements[index].hasClass('active')) {
                _.menuLinkElements[index].removeClass('active');
            }
        }

        function isActiveSection(scrollTop) {
            if (index + 1 < _.sectionOffsets.length) {
                return scrollTop >= _.sectionOffsets[index] && scrollTop < _.sectionOffsets[index + 1];
            } else {
                return scrollTop >= _.sectionOffsets[index];
            }
        }
    }
};

/// <summary>
/// Hook into menu click events and create
/// custom scroll behavior with url hash updating.
/// </summary>
Main.HandleMenuNavigation = function() {

    // Fetch the base document title.
    var documentTitleBase = document.title;

    // Array of the top position for each section.
    var menuSectionPositionTops = {};
    var menuSectionLinks = {};

    // Current active section.
    var activeSection = '';

    // Track scrolling to update menu.
    setTrackingForSectionScrolling();

    // Replace the current state which practically speaking will
    // update the navigation bar so people can subsequen
    function replaceState(newStateTitle) {

        // Reset the original title.
        document.title = documentTitleBase;

        // Empty string is 'home' state.
        if (newStateTitle === '') {
            newStateTitle = '/';
        } else {

            // Add new state to title if not home state.
            document.title += ' - ' + newStateTitle;
        }

        // Update the page history state, provide lowercased title for URL.
        window.history.replaceState(null, '', newStateTitle.toLowerCase());
    }

    // Scrolling around the page will also update the
    // menu and active section state.
    function setTrackingForSectionScrolling() {

        // Fetch object array to menu links which contain section info.
        var headerMenuLinks = $('#header-menu').find('.menu-link');

        headerMenuLinks.each(function () {

            // Fetch object.
            var menuLink = $(this);

            // Fetch id selector.
            var selector = menuLink.attr('href');

            // Fetch pixel top position of associated selector section.
            var sectionPositionTop = $(selector).position().top + MainConstants.headerHeight;

            sectionPositionTop = Math.ceil(sectionPositionTop);

            if (sectionPositionTop < 0) {
                sectionPositionTop = 0;
            }

            // Save link and position top.
            menuSectionLinks[selector] = menuLink;
            menuSectionPositionTops[selector] = sectionPositionTop;
        });

        // De-bounced window scrolling to update section.
        $(window).scroll($.debounce(250, function () {

            var highestSectionTopSeen = 0;
            var highestSectionIndexSeen = headerMenuLinks.first().attr('href');

            for (var index in menuSectionPositionTops) {

                // If we are scrolled past the lowest page section we have seen
                // so far (add a +1 as a rounding fudge factor).
                if (menuSectionPositionTops[index] < ($(this).scrollTop() + 1) &&
                    menuSectionPositionTops[index] > highestSectionTopSeen) {

                    // Set the highest top and index variables.
                    highestSectionTopSeen = menuSectionPositionTops[index];
                    highestSectionIndexSeen = index;
                }
            }

            // If we are in a different section.
            if (highestSectionIndexSeen != activeSection) {

                // Enable it, but do not scroll to it.
                enableActiveSection(menuSectionLinks[highestSectionIndexSeen]);
            }
        }));
    }

    // Given a section link object, enable and
    // optionally scroll to that section.
    function enableActiveSection(sectionLink) {

        // Set active section.
        activeSection = sectionLink.attr('href');

        // Remove active link class.
        $('#header-menu').find('.menu-link').removeClass('active');

        // Add to clicked element.
        sectionLink.addClass('active');

        // Update page state.
        replaceState(sectionLink.attr('title'));
    }
};
