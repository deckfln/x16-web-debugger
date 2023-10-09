"use strict";

let Menus = {}

$(document).ready(function(){

  Menus['dock-watch'] = new_dock_watch
  Menus['dock-cpu'] = new_dock_cpu
  Menus["dock-memory"] = new_dock_memory
  Menus["dock-disam"] = new_dock_disam
  Menus["dock-breakpoint"] = new_dock_breakpoints
  Menus["dock-files"] = new_dock_files
  Menus["dock-vram"] = new_dock_vram
  Menus["dock-vera"] = new_dock_vera

  $("nav div").click(function(){
          $("ul").slideToggle();
          $("ul ul").css("display", "none");
  });

  // $("ul li").click(function(){
  //     $("ul ul").slideUp();
  //     $(this).find('ul').slideToggle();
  // });
  $('nav ul li').click(function () {
      $(this).siblings().find('ul').slideUp();
      $(this).find('ul').slideToggle();
  });

  $(window).resize(function(){
      if($(window).width() > 768){
          $("ul").removeAttr('style');
      }
  });

  $('nav ul li a').click(function () {
    let id = this.id.substring(1)
    if (dock_exists(id)) {
      // close the dock
      dock_delete(id)
      let html = this.innerHTML
      html = html.replace("\u2611", "\u2610")
      this.innerHTML = html
    }
    else if (Menus[id] == undefined) {
        return
    }
    else {
      // create a new dock
      Menus[id]()

      // check the menu
      let html = this.innerHTML
      html = html.replace("\u2610", "\u2611")
      this.innerHTML = html
    }
  });

});

/**
 * Remove the checkmark next to a title
 * @param {*} title 
 */
function menu_uncheck(id)
{
  let menuId = "m"+id
  if (Menus[menuId] != undefined) {
      let node = $('#' + menuId)
      if (node.length > 0) {
        let html = node.html()
        html = html.replace("\u2611", "\u2610")
        node.html(html)
      }
  }
}