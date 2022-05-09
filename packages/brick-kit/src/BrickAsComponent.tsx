import { set } from "lodash";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { isObject } from "@next-core/brick-utils";
import {
  UseBrickConf,
  UseSingleBrickConf,
  RuntimeBrickElement,
  BrickEventsMap,
  UseBrickSlotsConf,
  BrickConf,
  RuntimeBrickConf,
  SlotsConf,
} from "@next-core/brick-types";
import { bindListeners, unbindListeners } from "./internal/bindListeners";
import { setRealProperties } from "./internal/setProperties";
import {
  RuntimeBrick,
  _internalApiGetCurrentContext,
  _internalApiGetResolver,
  _internalApiGetRouterState,
  _internalApiLoadDynamicBricksInBrickConf,
  RuntimeBrickConfWithTplSymbols,
  symbolForTplContextId,
  symbolForComputedPropsFromProxy,
  symbolForRefForProxy,
  expandCustomTemplate,
  getTagNameOfCustomTemplate,
  handleProxyOfCustomTemplate,
} from "./core/exports";
import { handleHttpError } from "./handleHttpError";
import {
  transformProperties,
  doTransform,
  DoTransformOptions,
} from "./transformProperties";
import { looseCheckIfByTransform } from "./checkIf";
import { isPreEvaluated } from "./internal/evaluate";
import { cloneDeepWithInjectedMark } from "./internal/injected";
import {
  listenOnTrackingContext,
  TrackingContextItem,
} from "./internal/listenOnTrackingContext";

interface BrickAsComponentProps {
  useBrick: UseBrickConf;
  data?: unknown;
  /**
   * @deprecated
   */
  parentRefForUseBrickInPortal?: React.RefObject<HTMLElement>;
}

interface SingleBrickAsComponentProps extends BrickAsComponentProps {
  useBrick: UseSingleBrickConf;
  refCallback?: (element: HTMLElement) => void;
  immediatelyRefCallback?: (element: HTMLElement) => void;
}

const expandTemplateInUseBrick = (
  useBrick: UseSingleBrickConf,
  tplTagName: string | false,
  brick: RuntimeBrick
): RuntimeBrickConf => {
  let template: RuntimeBrickConf;
  if (tplTagName) {
    // 如果是模板, 需要展开解析模板, 并遍历模板中的slots, 再给slots的brick绑定值给自身
    // 为后续ProxyRefs获取brick做值缓存
    const tplConf: RuntimeBrickConf = {
      brick: tplTagName,
      properties: brick.properties,
      events: useBrick.events,
      lifeCycle: useBrick.lifeCycle,
      slots: useBrick.slots as SlotsConf,
    };
    template = expandCustomTemplate(
      tplConf,
      brick,
      _internalApiGetCurrentContext()
    );
  } else if (
    (useBrick as RuntimeBrickConfWithTplSymbols)[symbolForRefForProxy]
  ) {
    (useBrick as RuntimeBrickConfWithTplSymbols)[symbolForRefForProxy].brick =
      brick;
  }
  return template;
};

const getCurrentRunTimeBrick = (
  useBrick: UseSingleBrickConf,
  tplTagName: string | false,
  data: unknown
): RuntimeBrick => {
  const trackingContextList: TrackingContextItem[] = [];
  const tplContextId = (useBrick as RuntimeBrickConfWithTplSymbols)[
    symbolForTplContextId
  ];
  const transformOption: DoTransformOptions = {
    // Keep lazy fields inside `useBrick` inside the `properties`.
    // They will be transformed by their `BrickAsComponent` later.
    $$lazyForUseBrick: true,
    trackingContextList,
    allowInject: true,
    tplContextId,
  };

  const properties = doTransform(
    data,
    cloneDeepWithInjectedMark(useBrick.properties) || {},
    transformOption
  );

  const brick: RuntimeBrick = {
    ...useBrick,
    type: tplTagName || useBrick.brick,
    // Now transform data in properties too.
    properties,
  };

  const runtimeContext = _internalApiGetCurrentContext();

  listenOnTrackingContext(brick, trackingContextList, {
    ...runtimeContext,
    tplContextId,
  });

  return brick;
};

/**
 * 可以渲染单个 `useBrick` 的 React 组件。
 *
 * @example
 *
 * ```tsx
 * <BrickAsComponent
 *   useBrick={{
 *     brick: "your.any-brick"
 *   }}
 *   data={yourData}
 * />
 * ```
 *
 * @param props - 属性。
 */
export const SingleBrickAsComponent = React.memo(
  function SingleBrickAsComponent({
    useBrick,
    data,
    refCallback,
    immediatelyRefCallback,
  }: SingleBrickAsComponentProps): React.ReactElement {
    const templateRef = useRef<RuntimeBrickConf>();
    const tplTagName = getTagNameOfCustomTemplate(
      useBrick.brick,
      _internalApiGetCurrentContext().app?.id
    );

    const isBrickAvailable = React.useMemo(() => {
      if (isObject(useBrick.if) && !isPreEvaluated(useBrick.if)) {
        // eslint-disable-next-line
        console.warn("Currently resolvable-if in `useBrick` is not supported.");
      } else if (
        !looseCheckIfByTransform(useBrick, data, {
          allowInject: true,
          // useBrick 中嵌套custom-template的情况下, 会存在丢失getTplVariables的情况, 因此需要在此进行补充
          tplContextId: (useBrick as RuntimeBrickConfWithTplSymbols)[
            symbolForTplContextId
          ],
        })
      ) {
        return false;
      }

      return true;
    }, [useBrick, data]);

    const runtimeBrick = React.useMemo(async () => {
      if (!isBrickAvailable) {
        return null;
      }

      // If the router state is initial, ignore rendering the sub-brick.
      if (_internalApiGetRouterState() === "initial") {
        return;
      }

      _internalApiLoadDynamicBricksInBrickConf(useBrick as BrickConf).catch(
        handleHttpError
      );

      const brick = getCurrentRunTimeBrick(useBrick, tplTagName, data);

      templateRef.current = expandTemplateInUseBrick(
        useBrick,
        tplTagName,
        brick
      );

      // Let `transform` works still.
      transformProperties(
        brick.properties,
        data,
        useBrick.transform,
        useBrick.transformFrom,
        undefined,
        {
          allowInject: true,
        }
      );

      // 设置 properties refProperty值
      if (
        (useBrick as RuntimeBrickConfWithTplSymbols)[
          symbolForComputedPropsFromProxy
        ]
      ) {
        Object.entries(
          (useBrick as RuntimeBrickConfWithTplSymbols)[
            symbolForComputedPropsFromProxy
          ]
        ).forEach(([propName, propValue]) => {
          set(brick.properties, propName, propValue);
        });
      }

      if (useBrick.lifeCycle) {
        const resolver = _internalApiGetResolver();
        await resolver.resolve(
          {
            brick: useBrick.brick,
            lifeCycle: useBrick.lifeCycle,
          },
          brick,
          {
            ..._internalApiGetCurrentContext(),
            tplContextId: (useBrick as RuntimeBrickConfWithTplSymbols)[
              symbolForTplContextId
            ],
          }
        );
      }

      return brick;
    }, [useBrick, data, isBrickAvailable]);

    const innerRefCallback = React.useCallback(
      async (element: HTMLElement) => {
        immediatelyRefCallback?.(element);
        if (element) {
          let brick: RuntimeBrick;
          try {
            brick = await runtimeBrick;
          } catch (e) {
            handleHttpError(e);
          }
          // sub-brick rendering is ignored.
          if (!brick) {
            return;
          }
          brick.element = element;

          const { [symbolForTplContextId]: tplContextId } =
            useBrick as RuntimeBrickConfWithTplSymbols;

          if (useBrick.iid) {
            element.dataset.iid = useBrick.iid;
          }
          setRealProperties(element, brick.properties);
          unbindListeners(element);
          if (brick.events) {
            bindListeners(element, transformEvents(data, brick.events), {
              ..._internalApiGetCurrentContext(),
              tplContextId,
            });
          }
          // 设置proxyEvent
          handleProxyOfCustomTemplate(brick);

          if ((element as RuntimeBrickElement).$$typeof !== "custom-template") {
            if (!useBrick.brick.includes("-")) {
              (element as RuntimeBrickElement).$$typeof = "native";
            } else if (!customElements.get(useBrick.brick)) {
              (element as RuntimeBrickElement).$$typeof = "invalid";
            }
          }
        }

        refCallback?.(element);
      },
      [runtimeBrick, useBrick, data, refCallback, immediatelyRefCallback]
    );

    if (!isBrickAvailable) {
      return null;
    }

    return React.createElement(
      templateRef.current?.brick ?? (tplTagName || useBrick.brick),
      {
        ref: innerRefCallback,
      },
      ...slotsToChildren(
        (templateRef.current ?? useBrick).slots as UseBrickSlotsConf
      ).map((item: UseSingleBrickConf, index: number) => (
        <SingleBrickAsComponent key={index} useBrick={item} data={data} />
      ))
    );
  }
);

/**
 * 可以渲染 `useBrick` 的 React 组件。
 *
 * @remarks `useBrick` 可以传递单个或多个构件配置。
 *
 * @example
 *
 * ```tsx
 * <BrickAsComponent
 *   useBrick={{
 *     brick: "your.any-brick"
 *   }}
 *   data={yourData}
 * />
 * ```
 *
 * @param props - 属性。
 */
export function BrickAsComponent({
  useBrick,
  data,
}: BrickAsComponentProps): React.ReactElement {
  if (Array.isArray(useBrick)) {
    return (
      <>
        {useBrick.map((item, index) => (
          <SingleBrickAsComponent key={index} useBrick={item} data={data} />
        ))}
      </>
    );
  }
  return <SingleBrickAsComponent useBrick={useBrick} data={data} />;
}

function slotsToChildren(slots: UseBrickSlotsConf): UseSingleBrickConf[] {
  if (!slots) {
    return [];
  }
  return Object.entries(slots).flatMap(([slot, slotConf]) =>
    Array.isArray(slotConf.bricks)
      ? slotConf.bricks.map((child) => ({
          ...child,
          properties: {
            ...child.properties,
            slot,
          },
        }))
      : []
  );
}

function transformEvents(
  data: unknown,
  events: BrickEventsMap
): BrickEventsMap {
  return doTransform(data, events, {
    evaluateOptions: {
      lazy: true,
    },
  }) as BrickEventsMap;
}

/* istanbul ignore next */
// eslint-disable-next-line react/display-name
export const ForwardRefSingleBrickAsComponent = React.memo(
  forwardRef<HTMLElement, SingleBrickAsComponentProps>(
    function LegacySingleBrickAsComponent(
      { useBrick, data, refCallback }: SingleBrickAsComponentProps,
      ref
    ): React.ReactElement {
      const brickRef = useRef<HTMLElement>();
      const templateRef = useRef<RuntimeBrickConf>();
      const tplTagName = getTagNameOfCustomTemplate(
        useBrick.brick,
        _internalApiGetCurrentContext().app?.id
      );

      const isBrickAvailable = React.useMemo(() => {
        if (isObject(useBrick.if) && !isPreEvaluated(useBrick.if)) {
          // eslint-disable-next-line
          console.warn(
            "Currently resolvable-if in `useBrick` is not supported."
          );
        } else if (
          !looseCheckIfByTransform(useBrick, data, {
            allowInject: true,
            // useBrick 中嵌套custom-template的情况下, 会存在丢失getTplVariables的情况, 因此需要在此进行补充
            tplContextId: (useBrick as RuntimeBrickConfWithTplSymbols)[
              symbolForTplContextId
            ],
          })
        ) {
          return false;
        }

        return true;
      }, [useBrick, data]);

      /* istanbul ignore next (never reach in test) */
      useImperativeHandle(ref, () => {
        return brickRef.current;
      });

      const runtimeBrick = React.useMemo(async () => {
        if (!isBrickAvailable) {
          return null;
        }

        // If the router state is initial, ignore rendering the sub-brick.
        if (_internalApiGetRouterState() === "initial") {
          return;
        }

        _internalApiLoadDynamicBricksInBrickConf(useBrick as BrickConf).catch(
          handleHttpError
        );

        const brick = getCurrentRunTimeBrick(useBrick, tplTagName, data);

        templateRef.current = expandTemplateInUseBrick(
          useBrick,
          tplTagName,
          brick
        );

        // Let `transform` works still.
        transformProperties(
          brick.properties,
          data,
          useBrick.transform,
          useBrick.transformFrom,
          undefined,
          {
            allowInject: true,
          }
        );

        // 设置 properties refProperty值
        if (
          (useBrick as RuntimeBrickConfWithTplSymbols)[
            symbolForComputedPropsFromProxy
          ]
        ) {
          Object.entries(
            (useBrick as RuntimeBrickConfWithTplSymbols)[
              symbolForComputedPropsFromProxy
            ]
          ).forEach(([propName, propValue]) => {
            set(brick.properties, propName, propValue);
          });
        }

        if (useBrick.lifeCycle) {
          const resolver = _internalApiGetResolver();
          await resolver.resolve(
            {
              brick: useBrick.brick,
              lifeCycle: useBrick.lifeCycle,
            },
            brick,
            {
              ..._internalApiGetCurrentContext(),
              tplContextId: (useBrick as RuntimeBrickConfWithTplSymbols)[
                symbolForTplContextId
              ],
            }
          );
        }

        return brick;
      }, [useBrick, data, isBrickAvailable]);

      const innerRefCallback = React.useCallback(
        async (element: HTMLElement) => {
          brickRef.current = element;

          if (element) {
            let brick: RuntimeBrick;
            try {
              brick = await runtimeBrick;
            } catch (e) {
              handleHttpError(e);
            }
            // sub-brick rendering is ignored.
            if (!brick) {
              return;
            }
            brick.element = element;

            const { [symbolForTplContextId]: tplContextId } =
              useBrick as RuntimeBrickConfWithTplSymbols;

            if (useBrick.iid) {
              element.dataset.iid = useBrick.iid;
            }
            setRealProperties(element, brick.properties);
            unbindListeners(element);
            if (useBrick.events) {
              bindListeners(element, transformEvents(data, useBrick.events), {
                ..._internalApiGetCurrentContext(),
                tplContextId,
              });
            }
            // 设置proxyEvent
            handleProxyOfCustomTemplate(brick);

            if (
              (element as RuntimeBrickElement).$$typeof !== "custom-template"
            ) {
              if (!useBrick.brick.includes("-")) {
                (element as RuntimeBrickElement).$$typeof = "native";
              } else if (!customElements.get(useBrick.brick)) {
                (element as RuntimeBrickElement).$$typeof = "invalid";
              }
            }
          }
          refCallback?.(element);
        },
        [runtimeBrick, useBrick, data, refCallback]
      );

      if (!isBrickAvailable) {
        return null;
      }

      return React.createElement(
        templateRef.current?.brick ?? (tplTagName || useBrick.brick),
        {
          ref: innerRefCallback,
        },
        ...slotsToChildren(
          (templateRef.current ?? useBrick).slots as UseBrickSlotsConf
        ).map((item: UseSingleBrickConf, index: number) => (
          <SingleBrickAsComponent key={index} useBrick={item} data={data} />
        ))
      );
    }
  )
);
