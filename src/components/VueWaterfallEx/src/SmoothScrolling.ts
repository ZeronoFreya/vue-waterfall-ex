import { ease } from './ease'
import { requestAnimationFrame, cancelAnimationFrame } from './raf'
import { getNow, extend } from './lang'

interface optionsObj {
    [key:string]: string| number | boolean
}
interface eventObj {
    [key: string]: (Function|SmoothScrolling)[][]
}

const DEFAULT_OPTIONS: optionsObj = {
  speed: 20,
  accelerationY: 4,
  invert: false,
  easeTime: 800,
  scrollX: false,
  scrollY: true,
  bounceTime: 300
}
export default class SmoothScrolling {
  private options: optionsObj
  private _events: eventObj
  private el: HTMLElement
  private x: number
  private y: number
  private hasHorizontalScroll: boolean
  private hasVerticalScroll: boolean
  private minScrollX: number
  private maxScrollX: number
  private minScrollY: number
  private maxScrollY: number
  private speed: number
  private lastWheelDirection: string
  private isAnimating: boolean
  private animateTimer: any
  
  
  constructor(scrollEl:HTMLDivElement, options:optionsObj = {}) {

    this.options = extend({}, DEFAULT_OPTIONS, options)

    this._events = {}

    this.el = scrollEl.firstChild as HTMLElement
    this.x = 0
    this.y = 0
    this.hasHorizontalScroll = this.options.scrollX as boolean
    this.hasVerticalScroll = this.options.scrollY as boolean
    this.minScrollX = 0
    this.maxScrollX = 0
    this.minScrollY = 0
    this.maxScrollY = 0
    this.speed = this.options.speed as number
    this.lastWheelDirection = ''
    this.isAnimating = false


    scrollEl.addEventListener('mousewheel', this.mousewheel.bind(this))
  }

  on(type: string, fn: Function, context = this) {
    if (!this._events[type]) {
      this._events[type] = []
    }

    this._events[type].push([fn, context])
  }

  trigger(type: string, ...args: any[]) {
    const events = this._events[type]
    if (!events) {
      return
    }

    const eventsCopy = [...events]
    for (let i = 0; i < events.length; i++) {
      const event = eventsCopy[i]
      const [fn, context] = event
      if (fn) {
        // eslint-disable-next-line
        // fn.apply(context, [].slice.call(arguments, 1))
        (fn as Function).apply(context, args)
      }
    }
  }

  scrollTo(x: number, y: number, time: number = 0, easing = ease.bounce){
    if (x === this.x && y === this.y) {
      return
    }
    if (!time){
      this._translate(x, y)
      this.trigger('scroll', {
        x, y
      })
      this.resetPosition(this.options.bounceTime as number, ease.bounce)
    } else {
      this._animate(x, y, time, easing.fn)
    }
  }
  updateSize(size: { x: number; y: number }){
    this.maxScrollX = size.x * -1
    this.maxScrollY = size.y * -1
    this.resetPosition(this.options.bounceTime as number)
  }
  resetPosition(time = 0, easeing = ease.bounce){
    let x = this.x
    const roundX = Math.round(x)
    if (!this.hasHorizontalScroll || roundX > this.minScrollX) {
      x = this.minScrollX
    } else if (roundX < this.maxScrollX) {
      x = this.maxScrollX
    }

    let y = this.y
    const roundY = Math.round(y)
    if (!this.hasVerticalScroll || roundY > this.minScrollY) {
      y = this.minScrollY
    } else if (roundY < this.maxScrollY) {
      y = this.maxScrollY
    }
    // console.log(y, this.y);
    if (x === this.x && y === this.y) {
      return false
    }

    this.scrollTo(x, y, time, easeing)

    return true
  }

  _translate(x:number, y:number){
    this.el.style.transform = `translate(${x}px,${y}px)`
    this.x = x
    this.y = y
  }

  _animate(destX: number, destY: number, duration: number, easingFn: Function){
    const me = this
    let startX = this.x
    let startY = this.y
    let startTime = getNow()
    let destTime = startTime + duration
    let newY_c: number = 0

    function step(){
      let now = getNow()



      if (now >= destTime) {
        me.isAnimating = false
        me.speed = me.options.speed as number
        return
      }
      destY = destY > 0
        ? Math.round(destY * 0.94) : destY < me.maxScrollY
        ? Math.round( (destY - me.maxScrollY) * 0.94 + me.maxScrollY ) : destY;
      now = (now - startTime) / duration
      let easing = easingFn(now)
      let newX = (destX - startX) * easing + startX
      let newY = (destY - startY) * easing + startY

      me._translate(newX, newY)
      let isBackTop = newY > 0 && newY < newY_c
      let isBackBottom = isBackTop ? true : newY < me.maxScrollY && newY > newY_c
      if(isBackTop || isBackBottom){
        newY_c = 0
        me.isAnimating = false
        me.speed = me.options.speed as number
        me.resetPosition(me.options.bounceTime as number)
        return
      }
      newY_c = newY

      me.trigger('scroll', {
        x: me.x,
        y: me.y
      })
      if (me.isAnimating) {
        me.animateTimer = requestAnimationFrame(step)
      }

    }
    this.isAnimating = true
    cancelAnimationFrame(this.animateTimer)
    step()
  }

  mousewheel(e: any) {
    e.preventDefault()
    e.stopPropagation()
    const {accelerationY = 0.6, invert = false, easeTime = 300}:{
      accelerationY?: number;
      invert?: boolean;
      easeTime?: number
    } = this.options

    let wheelDeltaX
    let wheelDeltaY
    let wheelDirection
    switch (true) {
      case 'deltaX' in e:
        if (e.deltaMode === 1) {
          wheelDeltaX = -e.deltaX * this.speed
          wheelDeltaY = -e.deltaY * this.speed
        } else {
          wheelDeltaX = -e.deltaX / 10 * this.speed
          wheelDeltaY = -e.deltaY / 10 * this.speed
          wheelDirection = -e.deltaY < 0 ? 'down' : 'up'
        }
        break
      case 'wheelDeltaX' in e:
        wheelDeltaX = e.wheelDeltaX / 120 * this.speed
        wheelDeltaY = e.wheelDeltaY / 120 * this.speed
        break
      case 'wheelDelta' in e:
        wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.speed
        break
      case 'detail' in e:
        wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.speed
        break
      default:
        return
    }
    // console.log(wheelDirection);

    if(wheelDirection === this.lastWheelDirection){
      this.speed = Math.floor(this.speed + accelerationY * easeTime / 1000)
    }else{
      this.speed = this.options.speed as number
    }
    this.lastWheelDirection = wheelDirection as string
    let direction = invert ? -1 : 1
    wheelDeltaX *= direction
    wheelDeltaY *= direction

    let newX: number;
    let newY: number;
    newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0)
    newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0)

    // console.log(">>>",newY, this.y);
    this.scrollTo(newX, newY, easeTime as number, ease.swipeBounce)
  }
}
