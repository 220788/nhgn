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
				if(_state) 	return _state = false, infowindow.close();
				return _state = true, infowindow.open(_s.$map, marker);
			};
			google.maps.event.addListener(marker, 'click', info_event);
			info_event();
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