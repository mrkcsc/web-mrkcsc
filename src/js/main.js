var Main = {};
var MainConstants = {};

/// <summary>
/// When document is loaded, run all main
/// jQuery powered functionality.
/// </summary>
$(document).ready(function () {

    // Window size tracking.
    Main.TrackWindowSize();

    // Window scroll tracking.
    Main.TrackScrolling();

    // Handle navigation.
    //Main.HandleMenuNavigation();
});

/// <summary>
/// De-bounced tracking of window resize events.  When
/// the size changes, update the UI accordingly.
/// </summary>
Main.TrackWindowSize = function () {

    // Cache the header menu height.
    var headerMenuHeight = $('#header-menu').height();

    // Any time the window is re-sized.
    $(window).resize($.debounce(250, function () {

        // Update and provide the already
        // looked-up window object.
        updateWindowSize($(this));
    }));

    // Update once on load.
    updateWindowSize($(window));

    /// Update the size of the header section
    // element which triggers a CSS reflow.
    function updateWindowSize (window) {

        console.log('c: ' + $('#about-me').position().top);

        // Set the current header height (window height sans menu).
        MainConstants.headerHeight = window.height() - headerMenuHeight;

        console.log('c: ' + MainConstants.headerHeight);

        // Round the header height to prevent any weird half-pixel operations.
        MainConstants.headerHeight = Math.ceil(MainConstants.headerHeight);
    }
};

/// <summary>
/// Track window scroll events and use that information
/// to decide if header menu should stick to top.
/// </summary>
Main.TrackScrolling = function() {

    // Cache the header menu object.
    var headerMenu = $('#header-menu');

    // Track scroll events.
    $(window).scroll(function () {

        // Update menu positioning.
        positionHeaderMenu($(this));
    });

    // Position once on load.
    positionHeaderMenu($(window));

    // Update header positioning based on
    // where the user is on the page.
    function positionHeaderMenu (window) {

        // If we have scroll passed the header.
        if (window.scrollTop() > MainConstants.headerHeight) {

            // Set the menu to be fixed to top.
            if (headerMenu.hasClass('fixed') === false) {
                headerMenu.addClass('fixed');
            }
        } else {

            // Otherwise use default style.
            if (headerMenu.hasClass('fixed')) {
                headerMenu.removeClass('fixed');
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

    // Set initial position.
    setInitialPageScroll();

    // Track scrolling to update menu.
    setTrackingForSectionScrolling();

    // Make menu clicking function.
    setMenuClickingFunctionality();

    // Scroll page to a target section, on mobile
    // devices do not animate it.
    function scrollPageToActiveSection(animationTime) {

        // Scroll offset with a 1 pixel fudge factor.
        var scrollOffset = -MainConstants.headerHeight + 1;

        if (window.mobileCheck()) {

            // Scroll to associated section.
            //$(window).scrollTo(activeSection, { offset: scrollOffset });
        } else {



            // Scroll to associated section.
            //$(window).scrollTo(activeSection, animationTime, { offset: scrollOffset, easing: 'swing' });

            //$(window).animate({
            //    scrollTop: scrollOffset
            //}, animationTime);
        }
    }

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
        window.history.replaceState(null, null, newStateTitle.toLowerCase());
    }

    // Set the initial page scrolling
    // based on the active menu link.
    function setInitialPageScroll() {

        // Fetch the associated target link.
        activeSection = $('#header-menu').find('.menu-link.active').attr('href');

        // Scroll to active section.
        scrollPageToActiveSection(0);
    }

    // Scrolling around the page will also update the
    // menu and active section state.
    function setTrackingForSectionScrolling() {

        // Fetch object array to menu links which contain section info.
        var headerMenuLinks = $('#header-menu').find('.menu-link');

        headerMenuLinks.each(function () {

            // Fetch object.
            var menuLink = $(this);

            // Fetch id seleector.
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
                enableActiveSection(menuSectionLinks[highestSectionIndexSeen], false);
            }
        }));
    }

    // When user clicks on a link make sure they
    // get taken to proper section and also update
    // the browser url.
    function setMenuClickingFunctionality() {

        // Any time a menu link is clicked.
        $('#header-menu').on('click', '.menu-link', function () {

            // Enable and scroll to new active section.
            enableActiveSection($(this), true);

            // Stop default click.
            return false;
        });
    }

    // Given a section link object, enable and
    // optionally scroll to that section.
    function enableActiveSection(sectionLink, scrollToSection) {

        // Set active section.
        activeSection = sectionLink.attr('href');

        if (scrollToSection) {

            // Scroll to active section.
            scrollPageToActiveSection(500);
        }

        // Remove active link class.
        $('#header-menu').find('.menu-link').removeClass('active');

        // Add to clicked element.
        sectionLink.addClass('active');

        // Update page state.
        replaceState(sectionLink.attr('title'));
    }
};
