import { CALLS } from "./calls";
import { CALL_TYPE, LINE_TYPE } from "./countType";

/** The finished set's calls, every one with its line, under the count (reduced motion): Done set large, as the last word. */
export function AllCalls() {
  return (
    <ol className="col-start-1 row-start-3 m-0 mt-6 list-none p-0">
      {CALLS.map((item, index) => (
        <li key={item.call} className="mt-5">
          <p
            className={
              index === CALLS.length - 1
                ? CALL_TYPE
                : "m-0 font-display text-[20px] font-semibold leading-[1.05] tracking-[-0.02em] text-muted"
            }
          >
            {item.call}
          </p>
          <p className={LINE_TYPE}>{item.line}</p>
        </li>
      ))}
    </ol>
  );
}
