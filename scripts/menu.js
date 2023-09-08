const menus = {
  'menuWatch' : "watch",
  'menuCPU' : "cpu",
  "menuDUMP" : "dump",
  "menuASM": 'disassembler',
  "menuBRK": "breakpoints",
  "menuFiles": "files",
}

$(document).ready(function(){

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
    let title = menus[id]
    if (dock_exists(title)) {
      // close the dock
      dock_delete(title)
      let html = this.innerHTML
      html = html.replace("\u2713", " ")
      this.innerHTML = html
    }
    else {
      // create a new dock
      switch (id) {
        case "menuWatch":
          new_dock_watch()
          break
        case "menuCPU":
          new_dock_cpu()
          break
        case "menuDUMP":
          new_dock_memory()
          break
        case "menuASM":
          new_dock_disam()
          break
        case "menuBRK":
          new_dock_breakpoints()
          break
        case "menuFiles":
          new_dock_files()
          break
        default:
          return
        }

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
function menu_uncheck(title)
{
  for (let i in menus) {
    if (menus[i] == title) {
      let node = $('#' + i)
      if (node.length > 0) {
        let html = node.html()
        html = html.replace("\u2713", " ")
        node.html(html)
      }
      break
    }
  }
}