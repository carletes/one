/* -------------------------------------------------------------------------- */
/* Copyright 2002-2015, OpenNebula Project, OpenNebula Systems                */
/*                                                                            */
/* Licensed under the Apache License, Version 2.0 (the "License"); you may    */
/* not use this file except in compliance with the License. You may obtain    */
/* a copy of the License at                                                   */
/*                                                                            */
/* http://www.apache.org/licenses/LICENSE-2.0                                 */
/*                                                                            */
/* Unless required by applicable law or agreed to in writing, software        */
/* distributed under the License is distributed on an "AS IS" BASIS,          */
/* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   */
/* See the License for the specific language governing permissions and        */
/* limitations under the License.                                             */
/* -------------------------------------------------------------------------- */

define(function(require) {
  // Dependencies
//  require('foundation.abide');
  var Notifier = require('utils/notifier');
  var Locale = require('utils/locale');
  var Sunstone = require('sunstone');

  function BaseFormPanel() {
    return this;
  }

  BaseFormPanel.prototype = {
    'insert': _insert,
    'reset': _reset,
    'setAction': _setAction,
    'title': _title,
    'buttonText': _buttonText,
    'resetButton': _resetButton,
    'actionOptions': _actionOptions
  }

  return BaseFormPanel;

  function _insert(context) {
    var that = this;
    this.wizardElement = $(that.htmlWizard()).appendTo( $(".wizardForms", context) );
    if (that.htmlAdvanced) {
      this.advancedElement = $(that.htmlAdvanced()).appendTo( $(".advancedForms", context) );
    }

    //context.foundation('abide');
    Foundation.reflow(context, 'abide');

    $('#' + that.formPanelId + 'Wizard', context)
      .on('forminvalid.zf.abide', function(ev, frm) {
        Notifier.notifyError(Locale.tr("One or more required fields are missing or malformed."));
        Sunstone.hideFormPanelLoading(that.tabId);
      })
      .on('formvalid.zf.abide', function(ev, frm) {
        that.submitWizard(frm);
        return false;
      })
      .on("submit", function(ev) {
        ev.preventDefault();
      });

    $('#' + that.formPanelId + 'Advanced', context)
      .on('forminvalid.zf.abide', function(ev, frm) {
        Notifier.notifyError(Locale.tr("One or more required fields are missing or malformed."));
        Sunstone.hideFormPanelLoading(that.tabId);
      })
      .on('formvalid.zf.abide', function(ev, frm) {
        that.submitAdvanced(frm);
        return false;
      })
      .on("submit", function(ev) {
        ev.preventDefault();
      });

    that.setup(context);
  }

  function _reset(context) {
    this.wizardElement.remove();
    if (this.htmlAdvanced) {
      this.advancedElement.remove();
    }

    this.insert(context);
  }

  function _setAction(context, action) {
    var prevAction = this.action;

    this.action = action;

    if (prevAction != undefined && (prevAction != action || action == "update")) {
      this.reset(context);
    }
  }

  // @return [Object] actionOptions of the form based on the defined action
  function _actionOptions() {
    if (this.action) {
      var actionOptions = this.actions[this.action]
      if (actionOptions) {
        return actionOptions;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  // @return [String] The title of the form based on the defined action
  function _title() {
    var actionOptions = this.actionOptions();
    if (actionOptions) {
      return actionOptions.title;
    } else {
      return "";
    }
  }

  // @return [String] The buttonText of the form based on the defined action
  function _buttonText() {
    var actionOptions = this.actionOptions();
    if (actionOptions) {
      return actionOptions.buttonText;
    } else {
      return "";
    }
  }

  // @return [Boolean] Is enabled the reset button based on the defined action
  function _resetButton() {
    var actionOptions = this.actionOptions();
    if (actionOptions) {
      return actionOptions.resetButton;
    } else {
      return false;
    }
  }
})
