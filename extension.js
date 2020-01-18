const { Clutter, St, GLib } = imports.gi;
const { main: Main, panelMenu: PanelMenu, popupMenu: PopupMenu } = imports.ui;
const Lang = imports.lang;
const Tweener = imports.ui.tweener;

let menuButton = null;
let configFile = GLib.get_current_dir()
  .concat('/')
  .concat('.local/share/gnome-shell/extensions')
  .concat('/')
  .concat('gnome-extension-move-notifications')
  .concat('/')
  .concat('.config.json');

/**
 * Recover the Notifications Position X and Y from Config File
 *
 * @returns {Object} Position X and Y
 * Example: { x: 'CENTER', y: 'START' }
 */
function _getPosition() {
  const [success, content] = GLib.file_get_contents(configFile);
  if (success) return JSON.parse(String(content));
  return null;
}

/**
 * Set the axis align inside Config File in JSON format
 *
 * @param {String} axis
 * @param {String} align
 */
function _setPosition(axis, align) {
  let position = _getPosition();
  position[axis] = align;
  GLib.file_set_contents(configFile, JSON.stringify(position));
}

/**
 * Set the Position inside Config File
 * and Move the Notifications
 *
 * @param {String} axis
 * @param {String} align
 * @returns {Function}
 */
function _moveNotificationTo(axis, align) {
  return function() {
    if (axis === 'x') {
      _setPosition(axis, align)
      Main.messageTray._bannerBin.set_x_align(Clutter.ActorAlign[align]);
    } else if (axis === 'y') {
      _setPosition(axis, align)
      Main.messageTray._bannerBin.set_y_align(Clutter.ActorAlign[align]);
    }
  }
}

let text, button;

function _hideHello() {
  Main.uiGroup.remove_actor(text);
  text = null;
}

function _showHello() {
  let monitor = Main.layoutManager.primaryMonitor;

  if (!text) {
    text = new St.Label({
      style_class: 'helloworld-label',
      //text: typeof(GLib.get_current_dir),
      //text: 'hello',
      text: JSON.stringify(_getPosition()),
    });
    Main.uiGroup.add_actor(text);
  }

  text.opacity = 255;

  text.set_position(
    monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
    monitor.y + Math.floor(monitor.height / 2 - text.height / 2),
  );

  Tweener.addTween(text, {
    opacity: 0,
    time: 2,
    transition: 'easeOutQuad',
    onComplete: _hideHello,
  });
}

function init() {
  let position = _getPosition();
  Main.messageTray._bannerBin.set_x_align(Clutter.ActorAlign[position.x]);
  Main.messageTray._bannerBin.set_y_align(Clutter.ActorAlign[position.y]);

  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true,
  });

  let icon = new St.Icon({
    icon_name: 'system-run-symbolic',
    style_class: 'system-status-icon',
  });

  button.set_child(icon);
  button.connect('button-press-event', _showHello);
}

function enable() {
  menuButton = new PanelMenu.Button(1, 'MoveNotificationsMenu', false);

  let box = new St.BoxLayout();
  let icon =  new St.Icon({
    icon_name: 'system-run-symbolic',
    style_class: 'system-status-icon',
  });
  box.add(icon);

  let title = new PopupMenu.PopupMenuItem('Move Notifications', {
    hover: false,
    activate: false,
  });
  let separator = new PopupMenu.PopupSeparatorMenuItem();

  let submenuX = new PopupMenu.PopupSubMenuMenuItem('Position X');
  let optionLeft = new PopupMenu.PopupMenuItem('Left');
  let optionCenter = new PopupMenu.PopupMenuItem('Center');
  let optionRight = new PopupMenu.PopupMenuItem('Right');

  let submenuY = new PopupMenu.PopupSubMenuMenuItem('Position Y');
  let optionTop = new PopupMenu.PopupMenuItem('Top');
  let optionMiddle = new PopupMenu.PopupMenuItem('Middle');
  let optionBottom = new PopupMenu.PopupMenuItem('Bottom');

  submenuX.menu.addMenuItem(optionLeft);
  submenuX.menu.addMenuItem(optionCenter);
  submenuX.menu.addMenuItem(optionRight);

  submenuY.menu.addMenuItem(optionTop);
  submenuY.menu.addMenuItem(optionMiddle);
  submenuY.menu.addMenuItem(optionBottom);

  // Add icon to top panel
  menuButton.actor.add_child(box);
  // Assemble menu items
  menuButton.menu.addMenuItem(title);
  menuButton.menu.addMenuItem(separator);
  menuButton.menu.addMenuItem(submenuX);
  menuButton.menu.addMenuItem(submenuY);

  // Add events to menu options
  optionLeft.actor.connect('button-press-event', _moveNotificationTo('x', 'START'));
  optionCenter.actor.connect('button-press-event', _moveNotificationTo('x', 'CENTER'));
  optionRight.actor.connect('button-press-event', _moveNotificationTo('x', 'END'));
  optionTop.actor.connect('button-press-event', _moveNotificationTo('y', 'START'));
  optionMiddle.actor.connect('button-press-event', _moveNotificationTo('y', 'CENTER'));
  optionBottom.actor.connect('button-press-event', _moveNotificationTo('y', 'END'));

  Main.panel.addToStatusArea('MoveNotificationsMenu', menuButton, 0);
  Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
  menuButton.destroy();
  Main.panel._rightBox.remove_child(button);
}
