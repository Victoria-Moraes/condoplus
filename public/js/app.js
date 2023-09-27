function toggleMenu() {
    if( $('.sidenav').hasClass('sidenav--expanded') ) {
        $('.sidenav').removeClass('sidenav--expanded')
        $('.sidenav').addClass('sidenav--shrunken')
    } else if($('.sidenav').hasClass('sidenav--shrunken')) {
        $('.sidenav').addClass('sidenav--expanded')
        $('.sidenav').removeClass('sidenav--shrunken')
    }

    if( $('.menu-toggle__container').hasClass('menu-toggle__container--expanded') ) {
        $('.menu-toggle__container').removeClass('menu-toggle__container--expanded')
        $('.menu-toggle__container').addClass('menu-toggle__container--shrunken')
    } else if($('.menu-toggle__container').hasClass('menu-toggle__container--shrunken')) {
        $('.menu-toggle__container').addClass('menu-toggle__container--expanded')
        $('.menu-toggle__container').removeClass('menu-toggle__container--shrunken')
    }
}