let Menus = {}

$(document).ready(function(){

  Menus['mdock-watch'] = new_dock_watch
  Menus['mdock-cpu'] = new_dock_cpu
  Menus["mdock-memory"] = new_dock_memory
  Menus["mdock-disam"] = new_dock_disam
  Menus["mdock-breakpoint"] = new_dock_breakpoints
  Menus["mdock-files"] = new_dock_files
  Menus["mdock-vram"] = new_dock_vram

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
    let id = this.id;
    if (dock_exists(id)) {
      // close the dock
      dock_delete(id)
      let html = this.innerHTML
      html = html.replace("\u2713", " ")
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
      html = "\u2713" + html
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
        html = html.replace("\u2713", " ")
        node.html(html)
      }
  }
}