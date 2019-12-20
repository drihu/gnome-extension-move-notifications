const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;

function init() {}

function enable() {
  Main.messageTray._bannerBin.set_x_align(Clutter.ActorAlign.END);
  Main.messageTray._bannerBin.set_y_align(Clutter.ActorAlign.START);
}

function disable() {
  Main.messageTray._bannerBin.set_x_align(Clutter.ActorAlign.CENTER);
  Main.messageTray._bannerBin.set_y_align(Clutter.ActorAlign.START);
}
