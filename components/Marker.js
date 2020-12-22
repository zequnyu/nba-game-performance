import mapboxgl from 'mapbox-gl';

class ClickableMarker extends mapboxgl.Marker {
    onClick(handleClick) {
      this._handleClick = handleClick;
      return this;
    }

    _onMapClick(e) {
      const targetElement = e.originalEvent.target;
      const element = this._element;

      if (this._handleClick && (targetElement === element || element.contains((targetElement)))) {
        this._handleClick();
      }
    }
};

export default ClickableMarker;
