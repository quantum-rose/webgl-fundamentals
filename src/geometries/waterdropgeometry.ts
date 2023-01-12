import { BezierSegment } from '../extras/beziersegment';
import { Vector2 } from '../math';
import { BezierGeometry } from './beziergeometry';

export class WaterDropGeometry extends BezierGeometry {
    // 多段连续三次贝塞尔曲线的控制点
    private static _points = [
        new Vector2(0, -0.46830985915492956),
        new Vector2(0.04401408450704226, -0.46830985915492956),
        new Vector2(0.08626760563380281, -0.45774647887323944),
        new Vector2(0.1267605633802817, -0.44659624413145543),
        new Vector2(0.34330985915492956, -0.3873239436619718),
        new Vector2(0.5, -0.14788732394366197),
        new Vector2(0.45892018779342725, 0.0715962441314554),
        new Vector2(0.4413145539906103, 0.16549295774647887),
        new Vector2(0.40492957746478875, 0.2564553990610329),
        new Vector2(0.36795774647887325, 0.3438967136150235),
        new Vector2(0.2693661971830986, 0.5751173708920188),
        new Vector2(0.13673708920187794, 0.7875586854460094),
        new Vector2(0, 1.005281690140845),
    ];

    private static _segments = [
        new BezierSegment([this._points[0], this._points[1], this._points[2], this._points[3]]),
        new BezierSegment([this._points[3], this._points[4], this._points[5], this._points[6]]),
        new BezierSegment([this._points[6], this._points[7], this._points[8], this._points[9]]),
        new BezierSegment([this._points[9], this._points[10], this._points[11], this._points[12]]),
    ];

    constructor(widthSegments = 16, heightSegments = widthSegments / 4) {
        super(WaterDropGeometry._segments, widthSegments, heightSegments);
    }
}
