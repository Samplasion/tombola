import React from 'react';

export function joinWithAnd(arr: string[], and: React.ReactNode): React.ReactNode {
    if (arr.length < 2) {
        return arr[0];
    }
    return [arr.slice(0, arr.length-1).join(", "), and, (arr[arr.length-1])];
}