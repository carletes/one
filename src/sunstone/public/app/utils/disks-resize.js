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

define(function(require){
  var Locale = require('utils/locale');
  var Config = require('sunstone-config');
  var OpenNebula = require('opennebula');
  var OpenNebulaImage = require('opennebula/image');
  var RangeSlider = require('utils/range-slider');
  var DisksResizeTemplate = require('hbs!./disks-resize/html');

  return {
    'insert': _insert,
    'retrieve': _retrieve
  };

  function _insert(template_json, disksContext) {
    var template_disk = template_json.VMTEMPLATE.TEMPLATE.DISK
    var disks = []
    if ($.isArray(template_disk)) {
      disks = template_disk
    } else if (!$.isEmptyObject(template_disk)) {
      disks = [template_disk]
    }

    if (disks.length > 0) {
      disksContext.html(DisksResizeTemplate());

      OpenNebula.Template.show({
        data : {
            id: template_json.VMTEMPLATE.ID,
            extended: true
        },
        success: function(request, extendedTemplateJSON) {
          var extendedTemplateDisk = extendedTemplateJSON.VMTEMPLATE.TEMPLATE.DISK;
          var extendedDisks = []
          if ($.isArray(extendedTemplateDisk)) {
            extendedDisks = extendedTemplateDisk
          } else if (!$.isEmptyObject(extendedTemplateDisk)) {
            extendedDisks = [extendedTemplateDisk]
          }

          var disk_cost = template_json.VMTEMPLATE.TEMPLATE.DISK_COST;

          if (disk_cost == undefined) {
            disk_cost = Config.onedConf.DEFAULT_COST.DISK_COST;
          }

          if (disk_cost != 0 && Config.isFeatureEnabled("showback")) {
            $(".provision_create_template_disk_cost_div", disksContext).show();

            disksContext.on("input", '.uinput-slider', function(){
              var cost = 0;
              $('.uinput-slider-val', disksContext).each(function(){
                if ($(this).val() > 0) {
                  cost += $(this).val() * 1024 * disk_cost;
                }

                var diskContext = $(this).closest(".diskContainer");
                cost += diskContext.data('disk_snapshot_total_cost');
              })
              $(".cost_value", disksContext).html(cost.toFixed(2));
            });
          } else {
            $(".provision_create_template_disk_cost_div", disksContext).hide();
          }

          var diskContext;
          $(".disksContainer", disksContext).html("");
          $.each(extendedDisks, function(disk_id, disk) {
            diskContext = $('<div class="row diskContainer">'+
                '<div class="large-12 columns diskSlider">' +
                '</div>' +
              '</div>').appendTo($(".disksContainer", disksContext));

            diskContext.data('template_disk', disks[disk_id]);

            var sizeGB = Math.round(disk.SIZE / 1024);
            diskContext.data('original_size', sizeGB);

            var disk_snapshot_total_size = 0;
            if (disk.DISK_SNAPSHOT_TOTAL_SIZE != undefined) {
              disk_snapshot_total_size = parseInt(disk.DISK_SNAPSHOT_TOTAL_SIZE);
            }

            diskContext.data('disk_snapshot_total_size', disk_snapshot_total_size);
            diskContext.data('disk_snapshot_total_cost', disk_snapshot_total_size * disk_cost);

            var label = disk.IMAGE ? disk.IMAGE : Locale.tr("Volatile Disk");
            var disabled =
              ( (disk.PERSISTENT && disk.PERSISTENT.toUpperCase() == "YES") ||
                (disk.TYPE && OpenNebulaImage.TYPES[disk.TYPE] == OpenNebulaImage.TYPES.CDROM) );

            RangeSlider.insert({
              'label': Locale.tr("DISK") + ' ' + disk_id + ': ' + label,
              'unitLabel': 'GB',
              'name': 'SIZE',
              'min': sizeGB,
              'max': sizeGB + 500,
              'step': 10,
              'initial': sizeGB,
              'disabled': disabled
            }, $(".diskSlider", diskContext));
          })
        }
      })
    } else {
      disksContext.html("");
    }
  }

  function _retrieve(context) {
    var disks = [];
    var disk, size;
    $(".diskContainer", context).each(function(){
      if ($(this).data("template_disk")) {
        disk = $(this).data("template_disk");

        if ($("#SIZE", this).is(':enabled')) {
          size = $("#SIZE", this).val();
          if (size) {
            disk['SIZE'] = Math.ceil(size * 1024);
          }
        }
      }

      if (disk) {
        disks.push(disk);
      }
    });

    return disks;
  }
});
