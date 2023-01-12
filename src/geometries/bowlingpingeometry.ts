import { BezierSegment } from '../extras/beziersegment';
import { Vector2 } from '../math';
import { BezierGeometry } from './beziergeometry';

export class BowlingPinGeometry extends BezierGeometry {
    // 多段连续三次贝塞尔曲线的控制点
    private static _points = [
        new Vector2(0.22739018087855298, 0),
        new Vector2(0.3204134366925065, 0.17054263565891473),
        new Vector2(0.32558139534883723, 0.34108527131782945),
        new Vector2(0.3049095607235142, 0.5736434108527132),
        new Vector2(0.2842377260981912, 0.8062015503875969),
        new Vector2(0.11369509043927649, 1.1111111111111112),
        new Vector2(0.103359173126615, 1.255813953488372),
        new Vector2(0.09302325581395349, 1.400516795865633),
        new Vector2(0.16020671834625325, 1.5193798449612403),
        new Vector2(0.18604651162790697, 1.6744186046511629),
        new Vector2(0.21188630490956073, 1.8294573643410854),
        new Vector2(0.20155038759689922, 2),
        new Vector2(0, 2),
    ];

    private static _segments = [
        new BezierSegment([this._points[0], this._points[1], this._points[2], this._points[3]]),
        new BezierSegment([this._points[3], this._points[4], this._points[5], this._points[6]]),
        new BezierSegment([this._points[6], this._points[7], this._points[8], this._points[9]]),
        new BezierSegment([this._points[9], this._points[10], this._points[11], this._points[12]]),
    ];

    constructor(widthSegments = 16, heightSegments = widthSegments / 4) {
        super(BowlingPinGeometry._segments, widthSegments, heightSegments, true);
    }
}
