# Datapuller

## What is the `datapuller`?

The `datapuller` is a modular collection of data-pulling scripts responsible for populating Berkeleytime's databases with course, class, section, grades, and enrollment data from the official university-provided APIs. This collection of pullers are unified through a singular entrypoint, making it incredibly easy for new pullers to be developed. The original proposal can be found [here](https://docs.google.com/document/d/1EdfI5Cmsk91LwZtUN0VSC5HEKy4RRuMhLhw8TRKRQrM/edit?tab=t.0#heading=h.c6lfrfjeglpv)[^1].

### Motivation

Before the `datapuller`, all data updates were done through a single script run everyday. The lack of modularity made it difficult to increase or decrease the frequency of specific data types. For example, enrollment data changes rapidly during enrollment season—it would be beneficial to be able to update our data more frequently than just once a day. However, course data seldom changes—it would be efficient to update our data less frequently.

Thus, `datapuller` was born, modularizing each puller into a separate script and giving us more control and increasing the fault-tolerance of each script.

[^1]: Modifications to the initial proposal are not included in the document. However, the motivation remains relatively consistent.
