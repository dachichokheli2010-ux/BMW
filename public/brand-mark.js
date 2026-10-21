// Original Motron monogram. It is independent of BMW's badges and M graphics.
export const MOTRON_MARK_PATH='M4 26V6h5l7 10L23 6h5v20h-6V16l-6 8-6-8v10Z';
export function motronMark(className=''){
 const value=String(className).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg${value?` class="${value}"`:''} viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="${MOTRON_MARK_PATH}" fill="currentColor"/></svg>`;
}
