(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);
+function ($) { 
	"use strict";
	var mgmap = function(element, options) {
		this.options = options;
		this.markers = options.markers;
		this.control = options.control;
		this.phrases = options.phrases;
		this.$element = $(element);
		this.$map = null;
		this.init();
	}
	mgmap.prototype = {
		constructor: mgmap,
		init: function () {
			this._ajheight();
			return google.maps.event.addDomListener(window, 'load', $.proxy(this.render, this));
		},
		render: function() {
			var _cidmap = this._rand()
			$('<div/>', {
				id: _cidmap,
				'class': 'mgmap-render'
			}).appendTo(this.$element);
			
			var _mapoptions = {
				zoom: this.options.zoom,
				center: this._position(this.options.latitude, this.options.longitude),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			this.$map = new google.maps.Map(document.getElementById(_cidmap), _mapoptions);
			this._ajposition(this);
			this._control();
			this._cpr();
			//this.$info = new google.maps.InfoWindow();
			return this.marker();
		},
		marker: function() {
			var _s = this,_state=false;
			var marker = new google.maps.Marker({
				map: _s.$map, 
				position: _s._position(this.markers.latitude,_s.markers.longitude),
				animation: google.maps.Animation.DROP,
				icon: _s.markers.icon,
				title: _s.markers.title
			});
			var infowindow = new google.maps.InfoWindow({
				content: _s.markers.text
			});
			var info_event = function() {
				if(_state) return _state = false, infowindow.close();
				return _state = true, infowindow.open(_s.$map, marker);
			};
			google.maps.event.addListener(marker, 'click', info_event);
			if(!$.browser.mobile) {
				info_event();
			}
			this.infowindow = infowindow;
		},
		
		_control: function() {
			var _cid = this._rand(), _s = this;
			$('<div/>', {
				id: _cid,
				'class': 'mgmap-control clearfix'
			}).insertAfter(this.$element);
			 _s.$map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById(_cid));
			if(_s.control.dir) {
				var _ic = this._rand();
				this.dirres = _ic;
				this.dirService = new google.maps.DirectionsService();
				this.dirRenderer = new google.maps.DirectionsRenderer({map: _s.$map});
				_s._dir(_cid);
			}
		},
		_dir: function() {
			var _s = this, control;
			var input = _s.options.directions_input;			
			if (this.options.directions_panel) {
                _s.options.directions_panel = $(this.options.directions_panel);
                _s.dirRenderer.setPanel(this.options.directions_panel.get(0));
            }
            if(input) {
            	input = $(input);
            	var _event = function(e) {
					var v = e ? e : $.trim(_in.value);
					if(	$.type(v) !== 'string' ) return;
					if( v.indexOf('@') != -1 ) v = v.split('@')[1];
					return _s._dirQuery(v);
				};
            	var autocomplete = new google.maps.places.Autocomplete(input.get(0));
				autocomplete.bindTo('bounds',_s.$map);
				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					 var place = autocomplete.getPlace();
					_event(place.formatted_address);
				});

				
				input.keypress(function(e) {
					if(e.which == 13) {
						_event();
					}
				});
				

            }
			if(_s.control.guide) {
				_s._dirGui();
			}
		},
		_dirQuery: function(origin) {
			var _s = this;
			_s.$element.addClass('wpanel');
			_s.infowindow.close();
			var _mqr = {
					origin: origin,
					destination: _s._position(_s.options.latitude,_s.options.longitude),
					travelMode: google.maps.TravelMode.DRIVING,
					unitSystem: google.maps.DirectionsUnitSystem.METRIC,
					provideRouteAlternatives: true
			};
			 _s.dirService.route(_mqr, function(r, s) {
					if (s != google.maps.DirectionsStatus.OK) {
						alert(_s.phrases.dir_error);
						return;
					}
					
					_s.dirRenderer.setDirections(r);
			});
		},
		_dirGui : function(_cid) {
			var _s = this, _g = _s.control.guide, dg = _s.options.directions_guid;
			if(!dg) return;
			var _uid = this._rand();
			var _dgui = $('<div/>', {
				'class': 'btn-group dir-gui-drop',
				html: '<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-expanded="false" id="dropdownDir">'+_s.phrases.gui_label+' <span class="caret"></span></button>'
			});
			var _ui = $('<ul/>', {
				id: _uid,
				'class': 'dropdown-menu',
			}).attr('aria-labelledby','dropdownDir');
			_dgui.appendTo(dg);
			_ui.appendTo(_dgui);
			
			$.each(_g, function() {
				var _d = this.split('@');
				$('<a/>', {
					'class': 'dir-gui-local',
					href: '#',
					text: _d[0],
					attr: {'data-latlng':_d[1], 'data-source': this}
				}).appendTo(_ui);
			});
			$('.dir-gui-local').wrapAll('<li></li>');

			
			$(dg+' li').click(function(e) {
				e.preventDefault();
				var d = $(e.target).attr('data-latlng');
				if(d) {
					var source = $(e.target).attr('data-source');
					$(_s.options.directions_input).val(source.split('@')[0]);
					return _s._dirQuery(d);
				}
			});
			//_dgui.find('span').click(_drop);
			$('#dropdownDir').dropdown();
		},
		_position: function(latitude,longitude) {
			return new google.maps.LatLng(latitude,longitude);
		},
		_rand: function() {
			return String(Math.random()).substr(2);
		},
		_scroll: function(offset) {
			return $("html, body").animate({ scrollTop: offset }, 500);
		},
		_ajheight: function() {
			var _wh = $(window).height();
			var _oe = this.$element, _he = _oe.offset().top, h = _wh - _he/2
			_oe.height( h );
			$(this.options.dir_panel).css('max-height',h);
			google.maps.event.addDomListener(window, 'resize', $.proxy(this._ajheight,this))
		},
		_ajposition: function(e) {
			return google.maps.event.addDomListener(window, 'resize', function() {
				e.$map.setCenter(e._position(e.options.latitude, e.options.longitude));
			});
		},
		_cpr: function() {
			var _cp = $('<span />', {
						id: 'marx-map-copy',
						html: 'jQuery Maps Plugin by <a href="http://marxvn.com" target="_blank">Marxvn.com</a>',
			});
			_cp.appendTo(this.$element);
			this.$map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(document.getElementById('marx-map-copy'));
		}
	}
	
	
	var old = $.fn.mgmap;
	
	$.fn.mgmap = function(option) {
        return this.each(function() {
            var $this = $(this),
			data = $this.data('mgmap'),
			options = $.extend({}, $.fn.mgmap.defaults, $this.data(), typeof option == 'object' && option);
			if (!data) $this.data('mgmap', (data = new mgmap(this, options)));
        })
    }

    $.fn.mgmap.defaults = {
        latitude: false,
		longitude: false,
		zoom: 10,
		center: false,
        phrases: {
			dir_error: 'Không thể chỉ đường từ vị trí này',
			dir_input: 'Nhập vị trí',
			dir_label: 'Tìm đường',
			dir_label_desc: 'Nhập vị trí xuất phát của bạn',
			dir_button: 'Tìm',
			gui_label: 'Gợi ý địa điểm'
		},
		markers: {},
		control: {
			dir: false,
			guide: false
		}
    }

    $.fn.mgmap.Constructor = mgmap


    /* NO CONFLICT
     * ================= */

    $.fn.mgmap.noConflict = function() {
        $.fn.mgmap = old
        return this
    }
	 
}(window.jQuery);