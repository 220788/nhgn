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
		_dir: function(_cid) {
			var _i = this._rand();
			var _id = this._rand();
			var _s = this, control;
			$('<div class="mgmap-input"><div class="control-group"><label class="control-label group-bt" for="'+_i+'">'+_s.phrases.dir_label+'</label><input id="'+_i+'" type="text" placeholder="'+_s.phrases.dir_input+'" class="input-xlarge" value=""><span class="group-bt" id="'+_id+'">'+_s.phrases.dir_button+'</span></div>').appendTo('#'+_cid);
			var _in = document.getElementById(_i);
			this._in = _in;
			var autocomplete = new google.maps.places.Autocomplete(_in);
			
			autocomplete.bindTo('bounds',_s.$map);

			$('<div/>', {
				id: _s.dirres,
				'class': 'dir_panel'
			}).appendTo(_s.$element);
			_s.dirRenderer.setPanel(document.getElementById(_s.dirres));
			
			var _event = function(e) {
				var v = e ? e : $.trim(_in.value);
				if(	$.type(v) !== 'string' ) return;
				if( v.indexOf('@') != -1 ) v = v.split('@')[1];
				return _s._dirQuery(v);
			};
			
			$('#'+_id).click(_event);
			$('#'+_i).keypress(function(e) {
				if(e.which == 13) {
					_event();
				}
			});
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				 var place = autocomplete.getPlace();
				_event(place.formatted_address);
			});
			if(_s.control.guide) {
				_s._dirGui(_cid);
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
			var _s = this, _g = _s.control.guide;
			var _uid = this._rand();
			var _dgui = $('<div/>', {
				'class': 'mgmap-gui-drop',
				html: '<span class="label">'+_s.phrases.gui_label+'</span>'
			});
			var _ui = $('<ul/>', {
				id: _uid,
				'class': 'mgmap-gui gui-drop'
			});
			_dgui.appendTo('#'+_cid);
			_ui.appendTo(_dgui);
			
			$.each(_g, function() {
				var _d = this.split('@');
				$('<li/>', {
					text: _d[0],
					attr: {'data-latlng':_d[1], 'data-source': this}
				}).appendTo(_ui);
			});
			var _drop = function() {
				var e = $('#'+_uid);
				e.toggle();
			};
			var _event = function() {
				_drop();
				var d = $(this).attr('data-latlng');
				if(d) {
					_s._in.value = $(this).attr('data-source');
					return _s._dirQuery(d);
				}
			}
			
			$('#'+_cid+' li').click(_event);
			_dgui.find('span').click(_drop);
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
			var _oe = this.$element, _he = _oe.offset().top;
			_oe.height( _wh - _he );
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
			gui_label: 'Gợi ý một số địa điểm'
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