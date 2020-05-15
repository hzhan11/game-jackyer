import * as React from "react";

import { Button, H5, Intent, ITagProps, MenuItem } from "@blueprintjs/core";
import { Example, IExampleProps } from "@blueprintjs/docs-theme";
import { ItemRenderer, MultiSelect, Select} from "@blueprintjs/select";

const FilmMultiSelect = MultiSelect.ofType<IFilm>();

interface IFilm {
    title: string;
    year: number;
    rank: number;
}

const FilmSelect = Select.ofType<IFilm>();

export interface IMultiSelectExampleState {
    allowCreate: boolean;
    createdItems: IFilm[];
    fill: boolean;
    films: IFilm[];
    hasInitialContent: boolean;
    intent: boolean;
    items: IFilm[];
    openOnKeyDown: boolean;
    popoverMinimal: boolean;
    resetOnSelect: boolean;
    tagMinimal: boolean;
}

export const TOP_100_FILMS: IFilm[] = [
    { title: "The Shawshank Redemption", year: 1994, rank: 2},
    { title: "The Godfather", year: 1972, rank: 3},
    { title: "The Godfather: Part II", year: 1974, rank: 5},
    { title: "The Dark Knight", year: 2008, rank: 10},
    { title: "12 Angry Men", year: 1957, rank: 7}
]

export class Test extends React.PureComponent<IExampleProps,IMultiSelectExampleState> {
    
    public state: IMultiSelectExampleState = {
        allowCreate: false,
        createdItems: [],
        fill: false,
        films: [],
        hasInitialContent: false,
        intent: false,
        items: TOP_100_FILMS,
        openOnKeyDown: false,
        popoverMinimal: true,
        resetOnSelect: true,
        tagMinimal: false,
    };

    private handleValueChange(){

    }

    public render() {
        return(
            <div>
                
            </div>
        )
    }
}